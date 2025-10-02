import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      product, 
      target_country, 
      gtip_code, 
      keywords, 
      competitors, 
      customers, 
      sales_channels,
      contact_name,
      // Legacy support for contact submissions
      productCategory, 
      targetCountries, 
      company, 
      notes 
    } = await request.json();

    // Determine if this is a conversation/form submission or contact submission
    const isConversation = product && target_country;
    
    let finalProduct, finalCountries, finalCompany, finalNotes;
    
    if (isConversation) {
      // Handle conversation/form submission data
      finalProduct = product;
      finalCountries = target_country;
      finalCompany = contact_name || 'Unknown Company';
      finalNotes = `GTIP Code: ${gtip_code || 'N/A'}
Sales Channels: ${Array.isArray(sales_channels) ? sales_channels.join(', ') : sales_channels || 'N/A'}
Existing Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords || 'N/A'}
Competitors: ${competitors || 'N/A'}
Customers: ${customers || 'N/A'}`;
    } else {
      // Handle contact submission data (legacy)
      finalProduct = productCategory;
      finalCountries = targetCountries;
      finalCompany = company;
      finalNotes = notes;
    }

    if (!finalProduct || !finalCountries) {
      return NextResponse.json(
        { error: 'Product and target country are required' },
        { status: 400 }
      );
    }

    // Parse target countries (could be comma-separated)
    const countries = finalCountries.split(',').map((c: string) => c.trim());
    const primaryCountry = countries[0];

    // Create the refined prompt based on the provided template
    const prompt = `Refined Prompt 1: Generate Company Search Keywords

Use this when you need keywords to find specific companies in a target industry and country.

Objective: Produce a list of search keywords for locating ${finalProduct} companies in ${primaryCountry} via Google advanced search.

Requirements:
- Keywords must target actual company websites, not directories, lists, newsletters, or informational sites.
- Exclude queries that return .org, .gov domains, or contact information pages.
- Focus on B2B contexts; ensure queries are compliant with advanced search parameters (e.g., site operators, exclusions).

Additional Context:
- Company: ${finalCompany}
- Product Category: ${finalProduct}
- Target Countries: ${finalCountries}
${finalNotes ? `- Additional Notes: ${finalNotes}` : ''}

Output: Provide 5-10 concise keywords or phrases, formatted as a bulleted list.

Then, also provide:

Refined Prompt 2: Create Category-Specific Search Queries

Objective: Generate up to three search queries per customer category to identify exact companies on Google.

Requirements:
- Each query must directly lead to company websites, avoiding any non-commercial results.
- Use advanced parameters (e.g., site:com, -directory, -list) for precision.
- Keep queries brief and specific; no verbosity.
- Exclude org/gov sites and contact info pages.

Output: A structured list with categories as headings, each containing 1-3 queries.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in B2B lead generation and Google search optimization. Generate precise, actionable search keywords and queries for finding companies in specific industries and countries. Focus on practical, results-oriented keywords that lead directly to company websites."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse the response to extract keywords and queries
    const sections = generatedContent.split('Refined Prompt 2:');
    const generatedKeywords = sections[0]?.trim() || '';
    const generatedQueries = sections[1]?.trim() || '';

    // If we have multiple countries, generate country-specific variations
    const countrySpecificKeywords = [];
    if (countries.length > 1) {
      for (const country of countries.slice(1)) {
        const countryPrompt = `The provided keywords/queries are effective. Now, update them specifically for ${country}, ensuring they are localized and compliant with the original constraints.

Original keywords for ${primaryCountry}:
${generatedKeywords}

Generate localized keywords for ${country}:`;

        const countryCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert in international B2B lead generation. Adapt search keywords for different countries while maintaining their effectiveness."
            },
            {
              role: "user",
              content: countryPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        countrySpecificKeywords.push({
          country,
          keywords: countryCompletion.choices[0]?.message?.content || ''
        });
      }
    }

    return NextResponse.json({
      success: true,
        data: {
          primaryCountry,
          keywords: generatedKeywords,
          queries: generatedQueries,
          countrySpecificKeywords,
          generatedAt: new Date().toISOString(),
          inputData: {
            product: finalProduct,
            target_country: finalCountries,
            company: finalCompany,
            notes: finalNotes,
            isConversation
          }
        }
    });

  } catch (error) {
    console.error('Error generating keywords:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
