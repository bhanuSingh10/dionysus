'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

type Props = {
    fileReferences: { fileName: string; sourceCode: string; summary: string }[] | null
}

const CodeReferences = ({ fileReferences }: Props) => {
    const [tab, setTab] = React.useState(fileReferences?.[0]?.fileName || '')

    return (
        <div className="max-w-[70vw]">
            <Tabs value={tab} onValueChange={setTab}>
                {/* Tabs List for Navigation */}
                <TabsList className="overflow-scroll flex gap-2 bg-gray-200 rounded-md">
                    {fileReferences?.map((file) => (
                        <TabsTrigger onClick={() => setTab(file.fileName)} key={file.fileName} value={file.fileName} className="whitespace-nowrap">
                            {file.fileName}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Tab Content */}
                {fileReferences?.map((file) => (
                    <TabsContent
                        key={file.fileName}
                        value={file.fileName}
                        className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md"
                    >
                        <SyntaxHighlighter language="typescript" style={lucario}>
                            {file.sourceCode}
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeReferences


// 'use client'
// import React from 'react'
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
// import { Button } from '@/components/ui/button'
// import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
// import { cn } from '@/lib/utils'


// type Props = {
//     fileReferences: { fileName: string; sourceCode: string; summary: string }[] | null
// }

// const CodeRefereces = ({fileReferences}: Props) => {
//     const [tab, setTab ] = React.useState(fileReferences ? fileReferences[0]?.fileName : '');
//   return (
//     <div className='max-w-[70vw]'>
//         <Tabs value={tab} onValueChange={setTab}>
//     <div className='overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md'>
//         {fileReferences?.map((file, index) => (
//             <Button key={file.fileName} className={cn("px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted",{
//                 "bg-primary text-primary-foreground": tab === file.fileName,
//             })}>{file.fileName}</Button>
//         ))}
//     </div>
//     {fileReferences?.map((file) =>
//     <TabsContent key={file.fileName} value={file.fileName} className='max-h-[40vh] overflow-scroll max-w-7xl rounded-md'>
//         <SyntaxHighlighter language='typescript' style={lucario}>{file?.sourceCode}</SyntaxHighlighter>
//     </TabsContent>)
//     }
//         </Tabs>
//     </div>
//   )
// }
// export default CodeRefereces;