import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject, deleteProject, setProjectStatus, updateProject } from '../api/projects'
import type { ProjectFormInput, ProjectStatus } from '../types/project'
import { projectsQueryKey } from './useProjects'

function useInvalidateProjects() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: projectsQueryKey })
}

// Projekte können eine customer-Relation setzen/ändern/verlieren – die Rückschau auf der
// Kundenkarte (core/hooks/useCustomerActivity.ts) muss das mitbekommen.
function useInvalidateProjectsAndCustomerActivity() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: projectsQueryKey })
    queryClient.invalidateQueries({ queryKey: ['customerActivity'] })
  }
}

export function useCreateProject() {
  const invalidate = useInvalidateProjectsAndCustomerActivity()
  return useMutation({
    mutationFn: createProject,
    onSuccess: invalidate,
  })
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjectsAndCustomerActivity()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectFormInput }) =>
      updateProject(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjectsAndCustomerActivity()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: invalidate,
  })
}

export function useSetProjectStatus() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      setProjectStatus(id, status),
    onSuccess: invalidate,
  })
}
