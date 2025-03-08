import { api } from '@/trpc/react';
import { log } from 'console';
import React from 'react';
import {useLocalStorage} from 'usehooks-ts';
const useProject = () => {
  const {data: projects} = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage('dionysus-projectId', '');
  const project = projects?.find(project => project.id === projectId) || null;
  console.log("project--------------",project);
  return {
    projects,
    project,
    projectId,
    setProjectId
  }
}

export default useProject
