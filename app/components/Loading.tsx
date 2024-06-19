import './components.css'
import LdSvg from '../../public/svg/loading.svg'

const Loading = () => {
  return <div className='loading'>
    <LdSvg/>
    {/* <svg width="200" height="200">
      <circle className="eye" cx="100" cy="100" r="28"></circle>
      <circle className="mouth" cx="100" cy="100" r="28"></circle>
    </svg> */}
  </div>
}

export default Loading;