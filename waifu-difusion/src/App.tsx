import {Routes,Route} from 'react-router-dom'
import WaifuDifusion from './pages/Waifus/components/WaifuDifusion'
import UserGenerations from './pages/userGenerations/Components/UserGenerations'
import Navbar from '@/components/Navbar'
import {ToastContainer} from 'react-toastify'


const App = () => {
  return (
    <div className=''>
      <Navbar />
      <div className='mt-20'>
        <Routes>
          <Route path='/' element={<WaifuDifusion/>}/>
          <Route path='/my-generate' element={<UserGenerations/>} />
        </Routes>
      </div>
    <ToastContainer />

    </div>
  )
}

export default App