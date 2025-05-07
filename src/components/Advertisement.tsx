import React, { useEffect } from 'react';

interface AdvertisementProps {
  className?: string;
}

export const Advertisement: React.FC<AdvertisementProps> = ({ className }) => {
  useEffect(() => {
    // Create the first script element for atOptions
    const atOptionsScript = document.createElement('script');
    atOptionsScript.type = 'text/javascript';
    atOptionsScript.text = `
      atOptions = {
        'key' : 'bef283aec24729ecc07f3b939df10f43',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    
    // Create the second script element for the invoke.js
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/bef283aec24729ecc07f3b939df10f43/invoke.js';
    
    // Get the ad container and append the scripts
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
      adContainer.innerHTML = ''; // Clear any existing content
      adContainer.appendChild(atOptionsScript);
      adContainer.appendChild(invokeScript);
    }
    
    // Cleanup function to remove scripts when component unmounts
    return () => {
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div id="ad-container" style={{ width: '728px', height: '90px' }}></div>
    </div>
  );
};