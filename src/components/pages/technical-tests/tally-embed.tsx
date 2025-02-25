import React, { useEffect } from 'react';
import Script from 'next/script'
import prisma from '~/lib/prisma';

interface SubmissionPayload {
	id: string; // submission ID
	respondentId: string;
	formId: string;
	formName: string;
	createdAt: Date; // submission date
	fields: Array<{
		id: string;
		title: string;
		type: 'INPUT_TEXT' | 'INPUT_NUMBER' | 'INPUT_EMAIL' | 'INPUT_PHONE_NUMBER' | 'INPUT_LINK' | 'INPUT_DATE' | 'INPUT_TIME' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'DROPDOWN' | 'CHECKBOXES' | 'LINEAR_SCALE' | 'FILE_UPLOAD' | 'HIDDEN_FIELDS' | 'CALCULATED_FIELDS' | 'RATING' | 'MULTI_SELECT' | 'MATRIX' | 'RANKING' | 'SIGNATURE' | 'PAYMENT';
		answer: { value: any; raw: any; };
	}>;
}

type Tally_From_Props = {
    userId: number,
    technicalTestId: number,
};

export default function Tally_From({userId, technicalTestId} : Tally_From_Props) {

    useEffect(() =>{
        const handleSumbitForm = async (e : MessageEvent) =>{
            if (e?.data?.includes('Tally.FormSubmitted')) {
                // unused
                const payload = JSON.parse(e.data).payload as SubmissionPayload;

                console.log('Submited!');

                // TODO SA SE UPDATEZE BAZA DE DATE DUPA CE COMPLETEAZA FORMU.
                const response = await fetch('/api/answer_test', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                      },
                    body: JSON.stringify({userId, technicalTestId})
                });

                if (response.ok) {
                    console.log('Database updated successfully');
                  } else {
                    console.error('Failed to update database');
                  }
                
            }
            
        }

        window.addEventListener('message', handleSumbitForm);
    }, [userId, technicalTestId])

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