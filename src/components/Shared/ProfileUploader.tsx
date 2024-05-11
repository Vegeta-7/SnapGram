import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

type ProfileUploaderProps = {
  fieldChange: (FILES: File[]) => void;
  mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {   //The parameter (acceptedFiles: FileWithPath[]) simply declares that the parameter acceptedFiles is of type FileWithPath[], which means it expects an array of FileWithPath objects to be passed when the onDrop function is called.
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));        
    },
    [file]
  );    

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
    },
  });
  
  return (
    <div{...getRootProps()}>
        <input {...getInputProps()} className="cursor-pointer" />              

        <div className="cursor-pointer flex-center gap-4">
            <img
                src={fileUrl || "assets/icons/profile-placeholder.svg"}                
                alt="image"
                className="h-24 w-24 rounded-full object-cover object-top"
            />
            <p>
                Change profile photo
            </p>
        </div>
    </div>
  );
};

export default ProfileUploader;
