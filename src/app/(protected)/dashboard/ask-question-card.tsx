import { Card, CardHeader, CardTitle,CardContent } from '@/components/ui/card';
import useProject from '@/hooks/use-project';
import React from 'react'

const AskQuestionCard = () => {
    const { project} = useProject();
  return (
    <>
      <Card>
        <CardHeader>
    <CardTitle>Ask a question</CardTitle>
    
        </CardHeader>
        <CardContent>
        <form>
            

        </form>
    </CardContent>
        
      </Card>
    </>
  )
}

export default AskQuestionCard
