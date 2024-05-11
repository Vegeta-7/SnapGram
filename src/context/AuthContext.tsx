import { getCurrentUser } from '@/lib/Appwrite/api';
import { IContextType, IUser } from '@/types'
import {createContext,useContext,useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER = {
    id: '',
    name: '',
    username: '',
    email: '',
    imageUrl: '',
    bio: ''
}

// this shown below is used to check if we have an logged in user at all times
const INITIAL_STATE ={
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: ()=>{},
    setIsAuthenticated: ()=>{},
    checkAuthUser: async () => false as boolean,
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);  //set it to the initial state

// AuthProvider wraps our entire app and provides access to the context
const AuthProvider = ({children}:{children: React.ReactNode}) => {   //The children prop is of type React.ReactNode, which indicates that it can accept any valid React node (e.g., components, elements, strings).
    const [user, setUser] = useState<IUser>(INITIAL_USER)
    const [isLoading, setIsLoading]=useState(false);
    const [isAuthenticated, setIsAuthenticated]=useState(false);
    
    const navigate=useNavigate();

    const checkAuthUser=async ()=>{        
        try{
            const currentAccount=await getCurrentUser();   // can't destructure it as getCurrentUser returns nothing if an error comes and it goes to catch
                        
            if(currentAccount){
                setUser({
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    username: currentAccount.username,
                    email: currentAccount.email,
                    imageUrl: currentAccount.imageUrl,
                    bio: currentAccount.bio
                })
                setIsAuthenticated(true);
                return true;
            }
            return false;
        }catch(err){
            console.log(err);
            return false;
        }finally{            
            setIsLoading(false)            
        }
    };

    useEffect(()=>{
        if(
            localStorage.getItem('cookieFallback') === '[]' ||
            localStorage.getItem('cookieFallback') === null
        ) navigate('/sign-in')
        
        checkAuthUser();
    },[]);


    const value={
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser
    }    
    return (
        <AuthContext.Provider value={value}>            
            {children}            
        </AuthContext.Provider>
    )
}

export default AuthProvider

export const useUserContext=()=>useContext(AuthContext);