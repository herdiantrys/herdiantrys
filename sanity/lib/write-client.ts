import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Write operations should not use CDN
    token: process.env.SANITY_API_TOKEN, // Required for write access
})
