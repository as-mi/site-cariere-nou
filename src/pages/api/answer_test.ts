import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method !== 'POST'){
        return res.status(405).json({message: 'Method not allowed'});
    }

    const {userId, technicalTestId} = req.body;

    if(!userId || !technicalTestId){
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try{
        const updateAnswer = await prisma.participantAnswersToTechnicalTest.create({
            data: {
                userId: userId,
                technicalTestId: technicalTestId,
                createdAt: Date(),
            },
        });
    }
    catch (e){
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
    
}