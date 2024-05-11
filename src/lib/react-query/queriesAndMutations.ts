import {
    useQuery,   // fetching the data
    useMutation,  // modifying the data
    useQueryClient,  // the useQueryClient hook is used to access the QueryClient object within a React component 
    useInfiniteQuery,  // In scenarios where you have a large set of data that needs to be fetched in chunks or pages, useInfiniteQuery simplifies the process of managing and querying that data.
    QueryClient
} from '@tanstack/react-query'
import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost, updateUser } from '../Appwrite/api'
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys';

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost)=>createPost(post),    
    onSuccess:() => {    //This ensures that the data for the 'getRecentPosts' query is refreshed whenever the query succeeds, ensuring that the UI is always displaying the most up-to-date data.
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS]   // only done to avoide mistakes in writing query keys
      })
    }
  })
}

export const useGetRecentPosts = () =>{
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  })
}

export const useLikePost = () =>{
  const queryClient=useQueryClient();

  return useMutation({
    mutationFn: ({postId, likesArray}:{postId: string,likesArray: string[]}) => likePost(postId,likesArray),
    onSuccess: (data)=>{
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_POST_BY_ID, data?.$id]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_CURRENT_USER]
      })
    }
  })
}

export const useSavePost = () =>{
  const queryClient=useQueryClient();

  return useMutation({
    mutationFn: ({postId, userId}:{postId: string,userId: string}) => savePost(postId,userId),
    onSuccess: ()=>{      
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_CURRENT_USER]
      })
    }
  })
}

export const useDeleteSavedPost = () =>{
  const queryClient=useQueryClient();

  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: ()=>{      
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_POSTS]
      })
      queryClient.invalidateQueries({
        queryKey:[QUERY_KEYS.GET_CURRENT_USER]
      })
    }
  })
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser
  })
}

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID],
    queryFn: () => getPostById(postId),
    enabled: !!postId
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({    
    mutationFn: (post:IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
      })
    }
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({    
    mutationFn: ({ postId, imageId }:{postId: string, imageId:string }) => deletePost(postId,imageId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
      })
    }
  })
}

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    getNextPageParam: (lastPage) => {
      if(lastPage && lastPage.documents.length === 0) return null;
      
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;

      return lastId
    }
  })
}

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],   //The searchTerm is included as part of the queryKey to differentiate queries based on different search terms.
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm    //The searchTerm is used to conditionally enable or disable the query based on its truthiness.
  })
}

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID,userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user:IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID,data?.$id],
      })
    }
  })
}