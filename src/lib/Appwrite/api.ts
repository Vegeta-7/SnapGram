import { ID, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser){   // used in SignupForm and INewUser is an interface of the user
    try{
        const newAccount=await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        )
        
        // putting the user in the database
        if(!newAccount) throw Error;

        const avatarUrl=avatars.getInitials(user.name)
        // console.log(avatars)

        const newUser=await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,   //user is from this line export async function createUserAccount(user: INewUser)
            imageUrl: avatarUrl,
        })

        return newUser;
    }catch(err){
        console.log(err);
        return err;
    }
}

export async function saveUserToDB(user: {
    accountId: string,
    email: string,
    name: string,
    imageUrl: URL,
    username?: string
}){
    // save the user on the appwrite database
    try{
        const newUser=await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )
        return newUser
    }catch(err){
        console.log(err)
    }
}

export async function signInAccount(user: {email:string; password:string}){
    try{
        // creating new email session
        const session=await account.createEmailSession(user.email,user.password)
        return session;
    }catch(err){
        console.log(err)
    }
}

export async function getCurrentUser(){
    try{
        const currentAccount=await account.get();

        if(!currentAccount) throw Error;

        const currentUser=await databases.listDocuments(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        if(!currentUser) throw Error;

        return currentUser.documents[0];
    }catch(err){
        console.log(err);
    }
}

export async function signOutAccount(){
    try{
        const session=await account.deleteSession("current")
        return session;
    }catch(err){
        console.log(err)
    }
}

export async function createPost(post: INewPost){
    try{
        // Upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        
        if(!uploadedFile) throw Error;

        //Get the File url
        const fileUrl = getFilePreview(uploadedFile.$id);

        if(!fileUrl){
            // file might be corrupted so also delete it
            deleteFile(uploadedFile.$id);
            throw Error;
        }     
        
        //convert tags to an array
        // .replace(/ /g,''): This is a method call on the tags property. It uses a regular expression (/ /g) to globally (g flag) replace all occurrences of spaces with an empty string. This effectively removes all spaces from the string.        
        const tags=post.tags?.replace(/ /g,'').split(',') || [];

        const newPost=await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        )
        if(!newPost){
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;        
    }catch(err){
        console.log(err)
    }
}

export async function uploadFile(file:File){
    try{
        const uploadedFile=await storage.createFile(
            appwriteConfig.storageID,
            ID.unique(),
            file
        );
        return uploadedFile;
    }catch(err){
        console.log(err);
    }
}

export function getFilePreview(fileId:string) {
    try {
        const fileUrl=storage.getFilePreview(
            appwriteConfig.storageID,
            fileId,
            2000,
            2000,
            "top",
            100,
        );
        if(!fileUrl){
            return Error;
        }
        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId:string) {
    try {
        await storage.deleteFile(
            appwriteConfig.storageID,
            fileId
        );
        return {status: 'ok'}
    } catch (error) {
        console.log(error)
    }
}

export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseID,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'),Query.limit(20)]
    )
    if(!posts){
        throw Error;        
    }return posts;
}

export async function likePost(postId: string, likesArray: string[]) {
    try{
        const updatedPost=await databases.updateDocument(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )
        if(!updatedPost) throw Error;

        return updatedPost;
    }catch(err){
        console.log(err);
    }
}

export async function savePost(postId: string, userId: string) {
    try{
        const updatedPost=await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.savesCollectionId,
            ID.unique(),            
            {
                user: userId,
                post: postId,
            }
        )
        if(!updatedPost) throw Error;

        return updatedPost;
    }catch(err){
        console.log(err);
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    try{
        const statusCode=await databases.deleteDocument(
            appwriteConfig.databaseID,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )
        if(!statusCode) throw Error;

        return {status: 'ok'};
    }catch(err){
        console.log(err);
    }
}

export async function getPostById(postId: string){
    try {
        const post=await databases.getDocument(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            postId
        )
        return post;
    } catch (error) {
        console.log(error)
    }
}

export async function updatePost(post: IUpdatePost){
    const hasFileToUpdate = post.file.length > 0;
    
    try{
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        };        

        if(hasFileToUpdate){
            // Upload image to storage
            const uploadedFile = await uploadFile(post.file[0]);
            
            if(!uploadedFile) throw Error;
    
            //Get the File url
            const fileUrl = getFilePreview(uploadedFile.$id);            
            
            if(!fileUrl){
                // file might be corrupted so also delete it
                deleteFile(uploadedFile.$id);
                throw Error;
            }   
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }


        
        //convert tags to an array
        // .replace(/ /g,''): This is a method call on the tags property. It uses a regular expression (/ /g) to globally (g flag) replace all occurrences of spaces with an empty string. This effectively removes all spaces from the string.        
        const tags=post.tags?.replace(/ /g,'').split(',') || [];

        const updatedPost=await databases.updateDocument(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            post.postId,
            {                
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        )
        if(!updatedPost){
            await deleteFile(post.imageId);
            throw Error;
        }
        return updatedPost;        
    }catch(err){
        console.log(err)
    }
}

export async function deletePost(postId:string, imageId: string) {
    if(!postId || !imageId) throw Error;
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            postId
        )
        return {status: 'ok'};
    } catch (error) {
        console.log(error)
    }
}

export async function getInfinitePosts({ pageParam }:{pageParam: number}) {
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]   // queries array of any type

    if(pageParam){
        queries.push(Query.cursorAfter(pageParam.toString()));  //if page 2 skip first 10 as limit is 10
    }
    try{
        const posts=await databases.listDocuments(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            queries
        )
        if(!posts) throw Error;
        return posts
    }catch(err){
        console.log(err)
    }    
}

export async function searchPosts(searchTerm: string) {    
    try{
        const posts=await databases.listDocuments(
            appwriteConfig.databaseID,
            appwriteConfig.postCollectionId,
            [Query.search('caption',searchTerm)]   //search by caption the searchTerm
        )
        if(!posts) throw Error;
        return posts
    }catch(err){
        console.log(err)
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseID,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
}

export async function getUserById(userId: string) {
    try{
        const user = await databases.getDocument(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            userId
        )
        if(!user){
            throw Error
        }return user;
    }catch(e){
        console.log(e)
    }
}

export async function updateUser(user: IUpdateUser){
    const hasFileToUpdate = user.file.length > 0;
    
    try{
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        };        

        if(hasFileToUpdate){
            // Upload image to storage
            const uploadedFile = await uploadFile(user.file[0]);
            
            if(!uploadedFile) throw Error;
    
            //Get the File url
            const fileUrl = getFilePreview(uploadedFile.$id);            
            
            if(!fileUrl){
                // file might be corrupted so also delete it
                deleteFile(uploadedFile.$id);
                throw Error;
            }   
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        const updateUser = await databases.updateDocument(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
            }
        )
        if(!updateUser){
            if(hasFileToUpdate){
                await deleteFile(image.imageId);
            }
            throw Error;
        }if(user.imageId && hasFileToUpdate){
            await deleteFile(user.imageId);
        }
        return updateUser;
    }catch(e){
        console.log(e)
    }
}