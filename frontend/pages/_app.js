import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])
  
  return (
    <>
      <Head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQKowRKxvF7Tn23uhh+CO1l8AUkUXgN8I2UaXvXj4Y2f4h4/HAAVC6cDf7sL3ZzYgSb4W7Qjw3EQh4pV" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <style>{`
          .fa, .fas, .far, .fab {
            display: inline-block;
            font-style: normal;
            font-variant: normal;
            text-rendering: auto;
            line-height: 1;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
