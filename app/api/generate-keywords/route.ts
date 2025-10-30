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

    // Create the optimized multilingual B2B query prompt (v2.1)
    const prompt = `Final Optimized & Localized Prompt (v2.1)

System / Instruction Layer:

You are a multilingual query generator for a B2B lead-sourcing AI.

Generate bilingual search queries for each sales channel provided, customized for the target country specified in the input.

Each query must lead to official company websites — not directories, marketplaces, or review pages.

1. Inputs

Sales channels: ${Array.isArray(sales_channels) ? sales_channels.join(', ') : finalProduct}

Target country: ${primaryCountry}

2. Anonymity & Variation

Do not include any consistent or repetitive wording across different generations.

Randomly alternate:

Language order (sometimes English first, sometimes local language first).

Synonyms for company type ("brand," "producer," "supplier," "manufacturer," etc.).

Avoid any identifiable text pattern or static signature.

3. Query Generation Rules

Each sales channel → one bilingual query (English + local language).

Each query should return company websites (manufacturers, brands, distributors).

Exclude directories, marketplaces, retail, reviews, or comparison pages.

Use local language and country modifiers relevant to the target country.

Maintain high semantic equivalence between English and local phrases.

Max 12 words per query.

4. Filters

Always append the following:

Generic: -retail -shop -review -directory -Alibaba -Amazon -list

Add localized equivalents based on the country:

- Germany → -Bewertung -Verzeichnis -Katalog
- France → -avis -annuaire -boutique
- Italy → -recensioni -negozio -elenco
- Spain → -reseña -tienda -directorio
- Japan → -レビュー -販売 -ディレクトリ
- Turkey → -değerlendirme -katalog -liste
- China → -评论 -目录 -商店
- (Auto-select based on target country: ${primaryCountry})

5. Output Format

Plain text list only — no numbering, markdown, or commentary.

Each bilingual query enclosed in parentheses, connected by OR.

Keep the input order and classification identical.

Form Data Provided:
- Company: ${finalCompany}
- Product Category: ${finalProduct}
- Target Country: ${primaryCountry}
- Target Countries: ${finalCountries}
${finalNotes ? `- Additional Context: ${finalNotes}` : ''}

6. Example Output Format

("dry shampoo brand Germany" OR "Trockenshampoo Marke Deutschland") -retail -Bewertung -shop -directory -Alibaba -Amazon  

("organic skincare manufacturer Germany" OR "Hersteller von Bio-Hautpflege Deutschland") -retail -Bewertung -shop -Verzeichnis -Katalog -Amazon  

("dental product supplier Germany" OR "Lieferant von Dentalprodukten Deutschland") -retail -Bewertung -shop -Verzeichnis -Alibaba -Amazon

Please generate bilingual search queries following these specifications.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a multilingual query generator for a B2B lead-sourcing AI. Generate bilingual search queries for each sales channel provided, customized for the target country. Each query must lead to official company websites — not directories, marketplaces, or review pages. Output plain text list only — no numbering, markdown, or commentary."
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
        const countryPrompt = `Localize the following bilingual B2B search queries for ${country}.

Original queries for ${primaryCountry}:
${generatedKeywords}

Requirements:
- Maintain the bilingual format: (English phrase OR Local language phrase)
- Update local language to match ${country}'s primary language
- Apply country-specific filters (e.g., -Bewertung for Germany, -avis for France)
- Keep query structure and intent identical
- Max 12 words per query
- Output plain text only, no numbering or markdown

Generate localized queries for ${country}:`;

        const countryCompletion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a multilingual query generator for B2B lead-sourcing. Adapt bilingual search queries for different countries while maintaining format and effectiveness. Output plain text only."
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
