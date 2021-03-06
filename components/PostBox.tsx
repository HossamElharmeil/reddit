import { LinkIcon, PhotographIcon } from '@heroicons/react/outline'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import Avatar from './Avatar'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { ADD_POST, ADD_SUBREDDIT } from '../graphql/mutations'
import { GET_SUBREDDIT_BY_TOPIC } from '../graphql/queries'
import client from '../apollo-client'
import toast from 'react-hot-toast'

type FormData = {
  postTitle: string
  postBody: string
  postImage: string
  subreddit: string
}

export default function PostBox() {
  const { data: session } = useSession()
  const [addPost] = useMutation(ADD_POST)
  const [addSubreddit] = useMutation(ADD_SUBREDDIT)

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()
  const [imageBoxOpen, setImageBoxOpen] = useState(false)

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData)
    const notification = toast.loading('Creating new post')

    try {
      const { data: getSubredditListByTopic } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: formData.subreddit,
        },
      })

      const subredditExists = false

      if (!subredditExists) {
        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: { topic: formData.subreddit },
        })

        const image = formData.postImage || ''

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image,
            subreddit_id: newSubreddit.id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        })

        console.log(newPost)
      } else {
        const image = formData.postImage || ''

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image,
            subreddit_id: getSubredditListByTopic[0].id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        })

        console.log(newPost)
      }

      setValue('postBody', '')
      setValue('postImage', '')
      setValue('postTitle', '')
      setValue('subreddit', '')

      toast.success('New post created', { id: notification })
    } catch (error) {
      console.error(error)
      toast.error('Whoops! something went wrong', { id: notification })
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-16 z-50 rounded-md border border-gray-300 bg-white"
    >
      <div className="flex items-center space-x-2">
        <Avatar />

        <input
          {...register('postTitle', { required: true })}
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          type="text"
          placeholder={
            session ? 'Create a post by entering a title' : 'Sign in to post'
          }
        />

        <PhotographIcon
          onClick={() => setImageBoxOpen((v) => !v)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen && 'text-blue-300'
          }`}
        />
        <LinkIcon className={`h-6 text-gray-300`} />
      </div>

      {!!watch('postTitle') && (
        <div className="flex flex-col py-2 px-2">
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              className="outline-one m-2 flex-1 bg-blue-50 p-2"
              {...register('postBody')}
              type="text"
              placeholder="Text (optional)"
            />
          </div>

          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Subreddit:</p>
            <input
              className="outline-one m-2 flex-1 bg-blue-50 p-2"
              {...register('subreddit', { required: true })}
              type="text"
              placeholder="i.e. reactjs"
            />
          </div>

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                className="outline-one m-2 flex-1 bg-blue-50 p-2"
                {...register('postImage')}
                type="text"
                placeholder="Optional..."
              />
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle?.type === 'required' && (
                <p>A Post Title is Required</p>
              )}
              {errors.subreddit?.type === 'required' && (
                <p>A Subreddit is required</p>
              )}
            </div>
          )}

          {!!watch('postTitle') && (
            <button
              type="submit"
              className="w-full rounded-full bg-blue-400 p-2 text-white"
            >
              Create Post
            </button>
          )}
        </div>
      )}
    </form>
  )
}
