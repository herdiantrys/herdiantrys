import { defineField, defineType } from 'sanity'
import { User } from 'lucide-react'

export const profile = defineType({
    name: 'profile',
    title: 'Profile',
    type: 'document',
    icon: User,
    fields: [
        defineField({
            name: 'fullName',
            title: 'Full Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'headline',
            title: 'Headlines',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Add multiple headlines to loop through (e.g. "Creative Developer", "UI/UX Designer")',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'profileImage',
            title: 'Profile Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'aboutImage',
            title: 'About Section Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ],
            description: 'Image displayed in the About section (GlassAbout.tsx)',
        }),
        defineField({
            name: 'bio',
            title: 'Biography',
            type: 'array',
            of: [{ type: 'block' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'string',
            validation: (rule) => rule.required().email(),
        }),
        defineField({
            name: 'phoneNumber',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'resumeURL',
            title: 'Resume / CV',
            type: 'file',
            options: {
                accept: '.pdf'
            }
        }),
        defineField({
            name: 'socialMedia',
            title: 'Social Media',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'platform',
                            title: 'Platform Name',
                            type: 'string',
                        }),
                        defineField({
                            name: 'url',
                            title: 'URL',
                            type: 'url',
                        }),
                        defineField({
                            name: 'icon',
                            title: 'Icon (Image)',
                            type: 'image',
                        })
                    ],
                    preview: {
                        select: {
                            title: 'platform',
                            media: 'icon'
                        }
                    }
                }
            ]
        }),
        defineField({
            name: 'skills',
            title: 'Skills',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'name',
                            title: 'Skill Name',
                            type: 'string',
                        }),
                        defineField({
                            name: 'icon',
                            title: 'Icon (Image)',
                            type: 'image',
                        }),
                        defineField({
                            name: 'proficiency',
                            title: 'Proficiency (%)',
                            type: 'number',
                            validation: (rule) => rule.min(0).max(100),
                        })
                    ],
                    preview: {
                        select: {
                            title: 'name',
                            media: 'icon'
                        }
                    }
                }
            ]
        }),
        defineField({
            name: 'experience',
            title: 'Experience',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'jobTitle', title: 'Job Title', type: 'string', validation: (rule) => rule.required() }),
                        defineField({ name: 'company', title: 'Company', type: 'string', validation: (rule) => rule.required() }),
                        defineField({ name: 'startDate', title: 'Start Date', type: 'date', options: { dateFormat: 'YYYY-MM' }, validation: (rule) => rule.required() }),
                        defineField({ name: 'endDate', title: 'End Date', type: 'date', options: { dateFormat: 'YYYY-MM' } }),
                        defineField({ name: 'isCurrent', title: 'Currently Working Here', type: 'boolean', initialValue: false }),
                        defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] })
                    ],
                    preview: {
                        select: {
                            title: 'jobTitle',
                            subtitle: 'company'
                        }
                    }
                }
            ]
        }),
        defineField({
            name: 'education',
            title: 'Education',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'degree', title: 'Degree', type: 'string', validation: (rule) => rule.required() }),
                        defineField({ name: 'institution', title: 'Institution', type: 'string', validation: (rule) => rule.required() }),
                        defineField({ name: 'startDate', title: 'Start Date', type: 'date', options: { dateFormat: 'YYYY-MM' }, validation: (rule) => rule.required() }),
                        defineField({ name: 'endDate', title: 'End Date', type: 'date', options: { dateFormat: 'YYYY-MM' } }),
                        defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] })
                    ],
                    preview: {
                        select: {
                            title: 'degree',
                            subtitle: 'institution'
                        }
                    }
                }
            ]
        })
    ],
    preview: {
        select: {
            title: 'fullName',
            media: 'profileImage',
        },
    },
})
