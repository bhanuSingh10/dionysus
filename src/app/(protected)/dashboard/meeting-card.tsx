"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { uploadFile } from '@/lib/cloudinary';  // ✅ No more 'fs' issues
import { Presentation, Upload } from 'lucide-react';
import React  from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar } from "react-circular-progressbar";
import { api } from '@/trpc/react';
import useProject from '@/hooks/use-project';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';


const MeetingCard = () => {
    const router = useRouter()
    const {project} = useProject();
    const processMeeting = useMutation({
        mutationFn: async ({ meetingUrl, meetingId, projectId }: { meetingUrl: string, meetingId: string, projectId: string }) => {
            const response = await axios.post('/api/process-meetings', { meetingUrl, meetingId, projectId });
            return response.data;
        }
    });
    const [progress, setProgress] = React.useState(0);  
    const [isUploading, setIsUploading] = React.useState(false);
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] }, 
        multiple: false,
        maxSize: 5000000,
        onDrop: async (acceptedFiles) => {
            if(!project) {
                return;
            }
            setIsUploading(true);
            const file = acceptedFiles[0];
            if(!file) {
                return;
            }
            const downloadURL = await uploadFile(file as File, setProgress) as string;

            if (file) {
                try {
                    const downloadURL = await uploadFile(file, setProgress);

                    await uploadMeeting.mutateAsync({
                        projectId: project.id,
                        meetingUrl: downloadURL,
                        name: file.name
                    }, {
                        onSuccess: (meeting) => {
                            toast.success("Meeting uploaded successfully");
                            router.push('/meetings')
                            processMeeting.mutateAsync({meetingUrl: downloadURL, meetingId: meeting!.id, projectId: project.id})
                        },
                        onError: (error) => {
                            toast.error("Failed to upload meeting. Try again.");
                        }
                    });

                  
                } catch (error) {
                    console.error("Upload failed", error);
                    window.alert("Upload failed. Try again.");
                }
            }

            setIsUploading(false);
        }
    });

    return (
        <Card className='flex flex-col col-span-2 items-center justify-center p-10' {...getRootProps()}>
            {isUploading ? (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Uploading Meeting...</h3>
                    <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' />
                    <p className='text-sm text-gray-500 text-center'>Uploading your meeting...</p>
                </>
            ) : (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Create a new meeting</h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with Dionysus.<br />Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                            <input className="hidden" {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
};

export default MeetingCard;
