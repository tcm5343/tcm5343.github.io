import { useParams } from 'react-router-dom';
import React  from 'react';

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