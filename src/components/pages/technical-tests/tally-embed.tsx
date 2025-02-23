import React from 'react';
import Script from 'next/script'

export default function Tally_From() {
    return (
        <div>
            <iframe data-tally-src='https://tally.so/embed/w4pzOA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1' 
            loading='lazy' 
            width='100%' 
            height='200'
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            title='Newsletter'></iframe>

        <Script
        src="https://tally.so/widgets/embed.js"/>
        </div>
    );
  }