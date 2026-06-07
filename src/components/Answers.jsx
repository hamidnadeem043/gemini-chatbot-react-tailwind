import ReactMarkdown from 'react-markdown'

const Answer = ({ ans }) => {
  return (
    <div className="text-zinc-200 text-[15px] leading-8">
      <ReactMarkdown>{ans}</ReactMarkdown>
    </div>
  )
}

export default Answer