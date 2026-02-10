
import { defineField, defineType } from 'sanity'

export const notification = defineType({
    name: 'notification',
    title: 'Notification',
    type: 'document',
    fields: [
        defineField({
            name: 'recipient',
            title: 'Recipient',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
            description: 'The user who receives the notification'
        }),
        defineField({
            name: 'sender',
            title: 'Sender',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
            description: 'The user who triggered the notification'
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Like Post', value: 'like_post' },
                    { title: 'Comment Post', value: 'comment_post' },
                    { title: 'Follow', value: 'follow' },
                    { title: 'System', value: 'system' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'relatedPost',
            title: 'Related Post',
            type: 'reference',
            to: [{ type: 'post' }],
            hidden: ({ document }) => document?.type !== 'like_post' && document?.type !== 'comment_post',
        }),
        defineField({
            name: 'relatedComment',
            title: 'Related Comment',
            type: 'reference',
            to: [{ type: 'comment' }],
            hidden: ({ document }) => document?.type !== 'comment_post',
        }),
        defineField({
            name: 'read',
            title: 'Read',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            senderName: 'sender.fullName',
            type: 'type',
            read: 'read'
        },
        prepare({ senderName, type, read }) {
            const typeMap: Record<string, string> = {
                like_post: 'liked your post',
                comment_post: 'commented on your post',
                follow: 'followed you',
                system: 'System Notification'
            }
            return {
                title: `${senderName || 'Someone'} ${typeMap[type as string] || type}`,
                subtitle: read ? 'Read' : 'Unread'
            }
        },
    },
})
