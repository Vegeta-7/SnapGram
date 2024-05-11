import {Client,Account,Databases,Storage,Avatars} from 'appwrite'

export const appwriteConfig={
    url : import.meta.env.VITE_APPWRITE_URL,     //VITE_APPWRITE_URL-->from env.local
    projectId : import.meta.env.VITE_APPWRITE_PROJECT_ID,    //VITE_APPWRITE_PROJECT_ID-->from env.local
    databaseID : import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageID : import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionId : import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    postCollectionId : import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,    
    savesCollectionId : import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,    
}

export const client=new Client();

client.setProject(appwriteConfig.projectId)  // setting project for that particular client that signed up or logged in
client.setEndpoint(appwriteConfig.url)

export const account=new Account(client);
export const databases=new Databases(client);
export const storage=new Storage(client);
export const avatars=new Avatars(client);