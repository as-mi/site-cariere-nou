import React, { useEffect } from 'react';
import Script from 'next/script'
import { trpc } from '~/lib/trpc';
import { useRouter } from "next/router";
import answers from '~/pages/api/technical-tests/[id]/answers';

interface SubmissionPayload {
	id: string; // submission ID
	respondentId: string;
	formId: string;
	formName: string;
	createdAt: string; // submission date
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

type AddTechnicalTestAnswer = {
  userId: number,
    technicalTestId: number,
    answers: string,
    createdAt: string,
};

export default function Tally_From({userId, technicalTestId} : Tally_From_Props) {

    const router = useRouter();

    const mutation = trpc.technicalTestAnswers.technicalTestAnswers.create.useMutation({
        onSuccess: () => {
            // router.push("/technicalTestAnswers/technicalTestAnswers");
          },
    });

    useEffect(() =>{
        const handleSumbitForm = async (e : MessageEvent) =>{
            if (e?.data?.includes('Tally.FormSubmitted')) {
                // unused
                const payload = JSON.parse(e.data).payload as SubmissionPayload;

                console.log('Submited!');

                // TODO SA SE UPDATEZE BAZA DE DATE DUPA CE COMPLETEAZA FORMU.

                const userAnswer : AddTechnicalTestAnswer = {
                    userId: userId,
                    technicalTestId: technicalTestId,
                    answers: JSON.stringify(payload.fields.map(field => ({
                        questionId: field.id,
                        answer: field.answer.value
                    }))),
                    createdAt: payload.createdAt,
                };


                mutation.mutate(userAnswer);
                
            }
            
        }

        window.addEventListener('message', handleSumbitForm);
    })

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