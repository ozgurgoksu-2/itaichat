// Google Analytics Event Tracking Utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Event tracking interface
interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  page?: string;
  placement?: string;
  button_text?: string;
}

// Track CTA click events
export const trackCTAClick = (eventData: {
  page: string;
  placement: string;
  button_text?: string;
  destination?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: `${eventData.page}_${eventData.placement}`,
      page: eventData.page,
      placement: eventData.placement,
      button_text: eventData.button_text || '',
      destination: eventData.destination || '',
      custom_map: {
        custom_page: eventData.page,
        custom_placement: eventData.placement
      }
    });
  }
};

// Track general button clicks
export const trackButtonClick = (eventData: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventData.action, {
      event_category: eventData.category || 'interaction',
      event_label: eventData.label || '',
      value: eventData.value || 1,
      page: eventData.page || '',
      placement: eventData.placement || ''
    });
  }
};

// Track page views
export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-75NPC5F8WZ', {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      custom_map: {
        custom_page_name: pageName
      }
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, page: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submit', {
      event_category: 'form',
      event_label: formName,
      page: page,
      form_name: formName
    });
  }
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText: string, placement: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'external_link',
      event_label: linkText,
      transport_type: 'beacon',
      external_url: url,
      placement: placement
    });
  }
};

// Track video play events
export const trackVideoPlay = (eventData: {
  page: string;
  placement: string;
  video_title?: string;
  video_duration?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'video_play', {
      event_category: 'engagement',
      event_label: `${eventData.page}_${eventData.placement}`,
      page: eventData.page,
      placement: eventData.placement,
      video_title: eventData.video_title || '',
      video_duration: eventData.video_duration || '',
      custom_map: {
        custom_page: eventData.page,
        custom_placement: eventData.placement
      }
    });
  }
};

// Track FAQ accordion toggle events
export const trackAccordionToggle = (eventData: {
  page: string;
  faq_question: string;
  action: 'open' | 'close';
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'accordion_toggle', {
      event_category: 'engagement',
      event_label: eventData.faq_question,
      page: eventData.page,
      faq_question: eventData.faq_question,
      accordion_action: eventData.action,
      custom_map: {
        custom_page: eventData.page,
        custom_faq_question: eventData.faq_question
      }
    });
  }
};
