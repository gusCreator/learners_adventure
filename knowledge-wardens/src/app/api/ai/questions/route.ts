import { API_KEY, RESOURCE_NAME } from '@/config';
import { createAzure } from '@ai-sdk/azure';
import { generateObject } from 'ai';
// import { getServerSession } from 'next-auth';
// import { authConfig } from '@/app/api/auth/[...nextauth]/authConfig';

import { z } from 'zod';

export const maxDuration = 30;

const az = createAzure({
  resourceName: RESOURCE_NAME,
  apiKey: API_KEY,
});

const model = az('gpt-4o');

export async function POST(res: Request) {
  // const session = await getServerSession(authConfig);

  // if (!session) {
  //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const formData = await res.formData();

  const request = z.object({
    course: z.string(),
    topicName: z.string(),
    topicDescription: z.string(),
  });

  const validatedRequest = request.safeParse({
    course: formData.get('course')?.toString(),
    topicName: formData.get('topicName')?.toString(),
    topicDescription: formData.get('topicDescription')?.toString(),
  });

  if (!validatedRequest.success) {
    return Response.json({ error: validatedRequest.error }, { status: 400 });
  }

  const response = await generateObject({
    model,
    schema: z.object({
      questions: z.array(z.string().describe('A question for the topic.')),
    }),
    system: 'response with questions of the topic, response six questions.',
    prompt: `The course is ${validatedRequest.data.course}, the topic is ${validatedRequest.data.topicName}, and the description is ${validatedRequest.data.topicDescription}, remember that you response in json format.`,
  });

  return Response.json(response.object);
}