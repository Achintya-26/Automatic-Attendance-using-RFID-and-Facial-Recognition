import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  return (
    <div id='header' className= 'flex items-center justify-between bg-slate-500 bg-opacity-70 border-b-2 h-14 px-14 m-3 rounded-3xl text-blue-950 shadow-md'>
        <div className='flex-shrink-0 hidden md:block'>
        <img className='w-28' src='https://d23qowwaqkh3fj.cloudfront.net/wp-content/uploads/2022/01/srm-logo-white.svg.gzip'/>
        </div>
        <div className='absolute  left-1/2 transform -translate-x-1/2'>
        <h1 className='text-3xl font-semibold'>Attendance Dashboard</h1>
        </div>
    </div>
  )
}
