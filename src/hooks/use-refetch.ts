import { QueryClient, useQueryClient } from '@tanstack/react-query'
import React from 'react'

const useRefetch = () => {
    const queryClient = useQueryClient();
  return async () => {
    // do something
    await queryClient.refetchQueries({
        type: "active"
    })
  }
}

export default useRefetch
