import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SignupValidation } from "@/lib/validation";
import { z } from "zod";
import Loader  from "@/components/Shared/Loader";
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";




const SignupForm = () => {
  const { toast }=useToast(); 
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext()  
  const navigate=useNavigate();


  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });



  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    // create user
    const newUser = await createUserAccount(values);  //from mutation    
    
    if(!newUser){
      return toast({
        title: "Sign up failed. Please Try Again.",        
      })
    }
    
    
    // sign the user into an session
    const session=await signInAccount({
      email: values.email,
      password: values.password
    });
    // console.log(session);

    if(!session){
      return toast({
        title: "Sign in failed. Please Try Again.",        
      })
    }

    //store session in react context so we know that we have a logged in user
    const isLoggedIn = await checkAuthUser();  

    if(isLoggedIn){
      form.reset();
      navigate('/')
    }else{
      return toast({
        title: "Sign up failed. Please Try Again."
      })
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo"/>
        
        <h2 className="h3 bold md:h2 bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 text-sm font-medium md:(text-sm font-normal) mt-2">To use Snapgram, please enter your details</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>                
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>                
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>                
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>                
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isCreatingAccount ? (
              <div className="flex-center gap-2">
                <Loader />Loading...
              </div>
            ): "Sign up"} 
          </Button>

          <p className="text-sm font-normal text-light-2 text-center mt-2">
              Already have an account?
              <Link to="/sign-in" className="text-sm font-semibold text-primary-500 ml-1">Log in</Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;