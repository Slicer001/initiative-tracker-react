import StatBlock from '../components/StatBlock.jsx';
import { useParams } from 'react-router-dom'
import '../components/StatBlock.css';

const StatBlockRenderer = () => {
    const { name } = useParams();

    return (
        <div className="wrapper">
            <StatBlock name={name} />
        </div>
    )
}

export default StatBlockRenderer