import React, { useState } from 'react'
import StudentTable from './StudentTable'
import axios from 'axios';
import useLoginStatus from './hooks/useLoginStatus'
import { useNavigate } from 'react-router-dom';

export default function ViewReport() {

	useLoginStatus();

	const [b, setb] = useState();
	const [s, sets] = useState();
	const [d, setd] = useState();
	const [sub, setsub] = useState();
	const [date, setdate] = useState();
	const [isloading, setisloading] = useState(true);
	const [isfilled, setisfilled] = useState(true);

	const navigate = useNavigate();


	const [data, setdata] = useState([]);

	const handleClick = async () => {
		setisloading(true);
		if(b && s && d && sub && date) {
			setisfilled(false);
			await axios.post('http://localhost:3001/teacher/lecture/report', {
				branch: b,
				sem: s,
				batch: d,
				subject: sub, 
				date: date
			},
			{
				withCredentials: true,
				baseURL: 'http://localhost:3001/'
			})
			.then((res) => {
				setdata(res.data.data)
				setisloading(false);
			})
			.catch((e) => {
				if(e.response.data.message === 'User not logged in'){
					navigate('/login')
					return;
				}
				window.alert(e.response.data.message);
				setisloading(true);
				setisfilled(true)
			});
		} else {
			window.alert('Enter all details')
		}
	};

  return (
	<div className='min-h-[calc(100vh-70px) w-full'>
		<div className='h-28 flex justify-evenly items-center bg-white bg-opacity-50 rounded-2xl m-5'>

			<div className='flex items-center gap-x-2'>
				<h1 className='text-xl text-blue-900'>Branch:</h1>
				<select onChange={(e) => setb(e.target.value)} value={b} name="branch" id="branch" className="text-base rounded-lg border bg-blue-50 b-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 py-1 px-2">
					<option value="" >Branch</option>
					<option value='CSE'>CSE</option>
					<option value='EEE'>EEE</option>
				</select>
			</div>

			<div className='flex items-center gap-x-2'>
				<h1 className='text-xl text-blue-900'>Semester:</h1>
				<select onChange={(e) => sets(e.target.value)} value={s} name="sem" id="sem" className="text-base rounded-lg border bg-blue-50 b-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 py-1 px-2">
					<option value="" >Semester</option>
					<option value='1'>1</option>
					<option value='2'>2</option>
					<option value='3'>3</option>
					<option value='4'>4</option>
					<option value='5'>5</option>
					<option value='6'>6</option>
					<option value='7'>7</option>
					<option value='8'>8</option>
				</select>
			</div>

			<div className='flex items-center gap-x-2'>
				<h1 className='text-xl text-blue-900'>Batch:</h1>
				<select onChange={(e) => setd(e.target.value)} value={d}  name="batch" id="batch" className="text-base rounded-lg border bg-blue-50 b-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 py-1 px-2">
					<option value="">Batch</option>
					<option value="1">1</option>
					<option value="2">2</option>
				</select>
			</div>

			<div className='flex items-center gap-x-2'>
				<h1 className='text-xl text-blue-900'>Subject:</h1>
				<select onChange={(e) => setsub(e.target.value)} value={sub}  name="subject" id="subject" className="text-base rounded-lg border bg-blue-50 b-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 py-1 px-2">
					<option value="" >Subject</option>
					<option value="AIOT">AIOT</option>
					<option value="IOE">IOE</option>					
					<option value="STQA">STQA</option>					
					<option value="IRS">IRS</option>					
					<option value="CSL">CSL</option>
				</select>
			</div>

			<div className='flex items-center gap-x-2'>
				<h1 className='text-xl text-blue-900'>Date:</h1>				
				<input onChange={(e) => setdate(e.target.value)} value={date} type="date" className='text-base rounded-lg border bg-blue-50 b-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 py-1 px-2' />
			</div>

			<button onClick={handleClick} className='bg-blue-700 hover:bg-blue-800 transition-colors text-white rounded-xl py-2 w-fit px-5 font-semibold'>Get report</button>
	 
		</div>
		{/* <ReportTable studentData={studentData}/> */}
		{
			!isfilled ? 
			<div className='bg-white min-h-[280px] m-6 rounded-xl mb-10'>
			{!isloading ? <StudentTable data={data} b={b} s={s} d={d} sub={sub} date={date} /> : <div className='flex w-full h-[280px] items-center justify-center gap-2 flex-col'><img className='aspect-square w-10' src='loading.gif'/><h1>Loading...</h1></div>}
			</div> 
			: 
			<div className='flex items-center justify-center font-semibold italic text-3xl text-blue-900 opacity-80 min-h-[280px] m-6 rounded-xl mb-10'>
				<h1>Enter details to retrieve attendance</h1>
			</div>

		}
		
	</div> 
  )
}
