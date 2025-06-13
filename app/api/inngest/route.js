import { serve } from 'inngest/next';
import { inngest, createUserOrder, syncUserCreation, syncUserDeletion, syncUserUpdation } from '@/config/inngest';


export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        syncUserUpdation,
        syncUserDeletion,
        syncUserCreation,
        createUserOrder
    ],
});
