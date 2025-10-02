'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CopyIcon, 
  CheckIcon, 
  LoaderIcon, 
  SearchIcon,
  GlobeIcon,
  TagIcon
} from 'lucide-react';

interface KeywordData {
  primaryCountry: string;
  keywords: string;
  queries: string;
  countrySpecificKeywords: Array<{
    country: string;
    keywords: string;
  }>;
  generatedAt: string;
  inputData: {
    productCategory: string;
    targetCountries: string;
    company: string;
    notes?: string;
  };
}

interface KeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionData: {
    // For contact submissions
    company?: string;
    product_category?: string;
    target_countries?: string;
    notes?: string;
    // For conversation/form submissions
    contact_name?: string;
    product?: string;
    target_country?: string;
    gtip_code?: string;
    keywords?: string[];
    competitors?: string;
    customers?: string;
    sales_channels?: string[];
  };
}

export function KeywordsModal({ isOpen, onClose, submissionData }: KeywordsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSections, setCopiedSections] = useState<Set<string>>(new Set());

  const generateKeywords = async () => {
    setIsGenerating(true);
    setError(null);
    setKeywordData(null);

    try {
      // Determine if this is a conversation or contact submission
      const isConversation = submissionData.product && submissionData.target_country;
      
      const requestBody = isConversation ? {
        // Conversation/form submission data
        product: submissionData.product,
        target_country: submissionData.target_country,
        gtip_code: submissionData.gtip_code,
        keywords: submissionData.keywords,
        competitors: submissionData.competitors,
        customers: submissionData.customers,
        sales_channels: submissionData.sales_channels,
        contact_name: submissionData.contact_name,
      } : {
        // Contact submission data (legacy)
        productCategory: submissionData.product_category,
        targetCountries: submissionData.target_countries,
        company: submissionData.company,
        notes: submissionData.notes,
      };

      const response = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate keywords');
      }

      setKeywordData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate keywords');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSections(prev => new Set([...prev, sectionId]));
      setTimeout(() => {
        setCopiedSections(prev => {
          const newSet = new Set(prev);
          newSet.delete(sectionId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatKeywords = (text: string) => {
    return text.split('\n').filter(line => line.trim()).map((line, index) => (
      <div key={index} className="text-sm text-gray-700 mb-1">
        {line.trim()}
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SearchIcon className="w-5 h-5 text-orange-500" />
            <span>Generate Search Keywords</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TagIcon className="w-4 h-4 text-blue-500" />
                <span>Submission Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Company:</span>
                  <p className="text-gray-900">{submissionData.contact_name || submissionData.company || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Product:</span>
                  <p className="text-gray-900">{submissionData.product || submissionData.product_category || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Target Country:</span>
                  <p className="text-gray-900">{submissionData.target_country || submissionData.target_countries || 'N/A'}</p>
                </div>
                {submissionData.gtip_code && (
                  <div>
                    <span className="font-medium text-gray-600">GTIP Code:</span>
                    <p className="text-gray-900">{submissionData.gtip_code}</p>
                  </div>
                )}
                {submissionData.keywords && submissionData.keywords.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Existing Keywords:</span>
                    <p className="text-gray-900">{submissionData.keywords.join(', ')}</p>
                  </div>
                )}
                {submissionData.sales_channels && submissionData.sales_channels.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">Sales Channels:</span>
                    <p className="text-gray-900">{submissionData.sales_channels.join(', ')}</p>
                  </div>
                )}
                {submissionData.competitors && (
                  <div>
                    <span className="font-medium text-gray-600">Competitors:</span>
                    <p className="text-gray-900">{submissionData.competitors}</p>
                  </div>
                )}
                {submissionData.customers && (
                  <div>
                    <span className="font-medium text-gray-600">Customers:</span>
                    <p className="text-gray-900">{submissionData.customers}</p>
                  </div>
                )}
                {submissionData.notes && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Notes:</span>
                    <p className="text-gray-900">{submissionData.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          {!keywordData && (
            <div className="text-center">
              <Button
                onClick={generateKeywords}
                disabled={isGenerating}
                className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-3"
              >
                {isGenerating ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    Generating Keywords...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Generate Keywords with GPT-4
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Generated Keywords */}
          {keywordData && (
            <div className="space-y-4">
              {/* Primary Keywords */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <GlobeIcon className="w-4 h-4 text-green-500" />
                      <span>Primary Keywords - {keywordData.primaryCountry}</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(keywordData.keywords, 'primary')}
                      className="flex items-center space-x-1"
                    >
                      {copiedSections.has('primary') ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <CopyIcon className="w-4 h-4" />
                      )}
                      <span>Copy</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {formatKeywords(keywordData.keywords)}
                  </div>
                </CardContent>
              </Card>

              {/* Search Queries */}
              {keywordData.queries && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <SearchIcon className="w-4 h-4 text-blue-500" />
                        <span>Advanced Search Queries</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(keywordData.queries, 'queries')}
                        className="flex items-center space-x-1"
                      >
                        {copiedSections.has('queries') ? (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                        <span>Copy</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {formatKeywords(keywordData.queries)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Country-Specific Keywords */}
              {keywordData.countrySpecificKeywords.map((countryData, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <GlobeIcon className="w-4 h-4 text-purple-500" />
                        <span>Keywords for {countryData.country}</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(countryData.keywords, `country-${index}`)}
                        className="flex items-center space-x-1"
                      >
                        {copiedSections.has(`country-${index}`) ? (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                        <span>Copy</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {formatKeywords(countryData.keywords)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Generation Info */}
              <div className="text-center text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  Generated at {new Date(keywordData.generatedAt).toLocaleString()}
                </Badge>
              </div>

              {/* Generate New Keywords Button */}
              <div className="text-center">
                <Button
                  onClick={generateKeywords}
                  disabled={isGenerating}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  {isGenerating ? (
                    <>
                      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-4 h-4 mr-2" />
                      Generate New Keywords
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
