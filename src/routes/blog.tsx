import { useParams } from 'react-router-dom';

function Blog() {
    const {blogId} = useParams()
    
    return (
    <>
    <div>
    blogId: {blogId}
    </div>
    </>
    )
}

export default Blog