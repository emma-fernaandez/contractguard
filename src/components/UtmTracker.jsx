
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Component to capture and store UTM parameters when users first visit the site
 * and save them to the user record after they sign up
 */
export default function UtmTracker() {
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user-utm'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    // Capture UTM parameters on first visit and store in localStorage
    const captureUtmParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmMedium = urlParams.get('utm_medium');
      const referrer = document.referrer;
      const landingPage = window.location.href;

      // Only capture if there are UTM parameters or a referrer
      if (utmSource || utmCampaign || utmMedium || referrer) {
        // Check if we've already captured UTM data
        const existingUtmData = localStorage.getItem('contractguard_utm_data');
        
        if (!existingUtmData) {
          const utmData = {
            original_utm_source: utmSource || '',
            original_utm_campaign: utmCampaign || '',
            original_utm_medium: utmMedium || '',
            original_referrer: referrer || '',
            landing_page: landingPage || '',
            captured_at: new Date().toISOString()
          };

          localStorage.setItem('contractguard_utm_data', JSON.stringify(utmData));
          console.log('[UTM Tracker] Captured UTM data:', utmData);
        }
      }
    };

    // Run capture on component mount
    captureUtmParams();
  }, []);

  useEffect(() => {
    // Save UTM data to user record after they sign up
    const saveUtmToUser = async () => {
      if (isLoading || !user) return;

      // Check if user already has UTM data saved
      if (user.original_utm_source || user.original_utm_campaign || user.original_utm_medium) {
        console.log('[UTM Tracker] User already has UTM data saved');
        return;
      }

      // Get stored UTM data
      const storedUtmData = localStorage.getItem('contractguard_utm_data');
      
      if (storedUtmData) {
        try {
          const utmData = JSON.parse(storedUtmData);
          
          // Only save if we have meaningful data
          if (utmData.original_utm_source || utmData.original_utm_campaign || utmData.original_utm_medium || utmData.original_referrer) {
            console.log('[UTM Tracker] Saving UTM data to user record:', utmData);
            
            await base44.auth.updateMe({
              original_utm_source: utmData.original_utm_source || null,
              original_utm_campaign: utmData.original_utm_campaign || null,
              original_utm_medium: utmData.original_utm_medium || null,
              original_referrer: utmData.original_referrer || null,
              landing_page: utmData.landing_page || null
            });

            // Set default account_status if not set
            if (!user.account_status) {
              await base44.auth.updateMe({
                account_status: 'free_trial'
              });
            }

            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['current-user-utm'] });
            
            // Clear localStorage after saving
            localStorage.removeItem('contractguard_utm_data');
            console.log('[UTM Tracker] UTM data saved successfully and cleared from localStorage');
          }
        } catch (error) {
          console.error('[UTM Tracker] Error saving UTM data:', error);
        }
      }
    };

    saveUtmToUser();
  }, [user, isLoading, queryClient]);

  // This component doesn't render anything
  return null;
}
