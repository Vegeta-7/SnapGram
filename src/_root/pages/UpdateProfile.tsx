import { useToast } from "@/components/ui/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queriesAndMutations"
import { ProfileValidation } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ProfileUploader from "@/components/Shared/ProfileUploader"
import { Textarea } from "@/components/ui/textarea"


const UpdateProfile = () => {
  const {toast} = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const {user, setUser}=useUserContext()
  const {data: updateUser, isPending: isLoadingUpdate } = useUpdateUser();
  const {data: currentUser } = useGetUserById(id || "");

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
    },
  })

  if(!currentUser){
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }
  
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    const updatedUser = await updateUser({
      userId: currentUser.$id,
      name: value.name,
      bio: value.bio,
      file: value.file,
      imageUrl: currentUser.imageUrl,
      imageId: currentUser.imageId,
    })
    if(!updateUser){
      toast({
        title:`Update user failed. Please try again`
      })
    }
    setUser({
      ...user,
      name: updateUser?.name,
      bio: updateUser?.bio,
      imageUrl: updateUser?.imageUrl,
    })
    return navigate(`/profile/${id}`);
  }
  
  return (    
    <div className="common-container">
      <div className="flex-start gap-3 justify-start w-full max-w-5xl">
        <img
          src="/assets/icons/edit.svg"
          width={36}            
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)} className="flex flex-col gap-7 w-full mt-4 max-w-5xl">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <ProfileUploader 
                    fieldChange={field.onChange}
                    mediaUrl={currentUser.imageUrl}                                    
                  />
                </FormControl>              
                <FormMessage className="shad-form_message"/>
              </FormItem>            
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Name</FormLabel>
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
                <FormLabel className="shard-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} disabled/>
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
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} disabled/>
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
                <FormLabel className="shad-form_label">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    className="shad-textarea custom-scrollbar w-full"
                    {...field}
                  />
                </FormControl>              
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-center justify-end">
            <Button type="button" className="shad-button_dark_4" onClick={()=>navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingUpdate}>
              {isLoadingUpdate && <Loader />}
              Update Profile
            </Button>
          </div>
      
        </form>
      </Form>
    </div>    
  )
}

export default UpdateProfile