import { type SchemaTypeDefinition } from 'sanity'
import { project } from './project'
import { category } from './category'
import { user } from './user'
import { comment } from './comment'
import { testimonial } from './testimonial'
import { partner } from './partner'
import { profile } from './profile'

import { contact } from './contact'

import { service } from './service'

import { post } from './post'
import { shopItem } from './shopItem'

import { notification } from './notification'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, project, category, profile, testimonial, partner, comment, contact, service, post, shopItem, notification],
}
