'use client';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Feature from '@/app/feature';
import Image from 'next/image';
import { toast } from 'react-toastify';

function useScrollToAnchor() {
  const lastHash = useRef('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);

      if (hash && hash !== lastHash.current) {
        lastHash.current = hash;

        // Small delay to ensure content is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Why embed Practivoo into your school's learning toolkit?",
      answer: "Practivoo saves teachers time, provides measurable insights into student performance, and keeps learners engaged. Also, interactive, self-correcting exercises help students understand what they learned in class."
    },
    {
      question: "Why is Practivoo innovative?",
      answer: "Practivoo combines automation, personalization, and gamification in one platform. In particular, it offers schools a smart way to manage English homework and track progress with minimal teacher effort.."
    },
    {
      question: "What are the benefits for students?",
      answer: "Students get unlimited access to interactive exercises to practice and revise at their own pace. They improve listening, grammar, vocabulary, pronunciation, and confidence with instant feedback and engaging activities."
    },
    {
      question: "How to use Practivoo?",
      answer: "Schools share their syllabus, and the app assigns the right exercises each week. When students complete weekly tasks, Practivoo gives them instant feedback and creates a report for teachers showing scores, mistakes, and overall progress"
    }
  ];

  const toggleAccordion = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id='faq-section' className='px-6 md:px-10 py-20'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-16 text-gray-800'>FAQs</h2>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-blue-50 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl'
            >
              <button
                onClick={() => toggleAccordion(index)}
                className='w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none'
              >
                <div className='flex items-start gap-4 flex-1'>
                  <div className='w-6 h-6 border-2 border-[#0042D2] rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <div className='w-2 h-2 bg-[#0042D2] rounded-full'></div>
                  </div>
                  <h3 className='text-xl md:text-xl font-bold text-gray-800 pr-4'>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-[#0042D2] transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className='px-6 md:px-8 pb-6 md:pb-8 pl-16 md:pl-20'>
                  <p className='text-lg text-gray-600 leading-relaxed'>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useScrollToAnchor();
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const SendInquery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('api/contact-form', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.status !== 200) {
      toast.error('Something went wrong. Please try again later.');
      return
    }

    const data = await res.json();
    toast.success(data.message);
    setForm({
      name: '',
      email: '',
      message: ''
    })
  }

  return (
    <div className='bg-blue-100 w-full min-h-screen'>
      {/* Header & Nav */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <nav className='max-w-7xl mx-auto   flex justify-between items-center p-5 px-6 '>
          <div className='flex gap-3 items-center'>
            <Image
              src="/home/logo.png"
              alt="Practivoo Logo"
              width={140}
              height={40}
              className='w- h-8 bg[#0042D2] md:w- md:h-10'
            />
          </div>
          <div className='flex gap-4 md:gap-6 items-center'>
            <a href='#' className='hidden md:block hover:text-[#0042D2] font-medium transition-colors'>Home</a>
            <a href='#about-us' className='hidden md:block hover:text-[#0042D2] font-medium transition-colors'>About Us</a>
            <a href='#pricing' className='hidden md:block hover:text-[#0042D2] font-medium transition-colors'>Pricing</a>
            <a
              href='#contact-us'
              className='flex items-center gap-2 border border-[#0042D2] bg-[#0042D2]  text-white pr-4 pl-1 py-1 rounded-full hover:bg-white hover:text-[#0042D2] transition-all duration-300 group relative overflow-hidden'
            >
              <span className='relative z-10 group-hover:bg-[#0042D2] group-hover:text-white bg-white text-[#0042D2] rounded-full p-1 md:p-2 '>
                <ArrowRight className='h-4 w-4 md:h-5 md:w-5 ' />
              </span>
              <span className='text-xs md:text-sm  relative z-10'>Contact Us</span>

              {/* Animated background */}
              <div className='absolute inset-0 bg-blue-100 bg- transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'></div>
            </a>
            <a
              href='/login'
              target='_top'
              className='flex items-center gap-2 border border-[#0042D2] text-[#0042D2] pr-4 pl-1 py-1 rounded-full hover:bg-[#0042D2] hover:text-white transition-all duration-300 group relative overflow-hidden'
            >
              <span className='relative z-10 group-hover:bg-white group-hover:text-[#0042D2] bg-[#0042D2] text-white rounded-full p-1 md:p-2 '>
                <ArrowRight className='h-4 w-4 md:h-5 md:w-5 ' />
              </span>
              <span className='text-xs md:text-sm  relative z-10'>Login as school</span>

              {/* Animated background */}
              <div className='absolute inset-0 bg-[#0042D2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'></div>
            </a>

          </div>
        </nav>
      </header>


      <section className='relative  max-w-7xl mx-auto  px-6 md:px-10 py-16 md:py-24'>
        <Image className="absolute left-2 top-6 md:left-4 md:top-10 " src="/home/8.png" alt="" width={120} height={120} />

        <div className=" top-5 right-4 md:top-10 md:right-0  rotate-45 w-20 h-10 md:w-48 md:h-24 overflow-hidden bg-blue-100 absolute" aria-hidden="true">
          <div className="relative w-20 h-20 md:w-48 md:h-48 rounded-full bg-amber-400 -translate-y-10 md:-translate-y-24 transform " >

            <div className='absolute w-8 h-8 md:w-24 md:h-24 rounded-full bg-blue-100 left-6 top-6 md:left-12 md:top-12'></div>
          </div>
        </div>


        <div className='relative text-center z-10 mt-18 md:mt-0'>
          <h2 className='text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight'>
            <span className='text-[#0042D2]'>Practice</span> Today
          </h2>
          <h2 className='text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mt-2'>
            Progress <span className='text-[#0042D2]'>Tomorrow</span>
          </h2>

          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-12'>
            <Image
              src="/home/10.png"
              alt="Get it on Google Play"
              width={160}
              height={60}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
            <Image
              src="/home/11.png"
              alt="Download on App Store"
              width={160}
              height={60}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
          </div>
        </div>

        <div className=" left-0 bottom-0  -rotate-45  md:left-0 md:bottom-0 w-20 h-10 md:w-48 md:h-24 overflow-hidden bg-blue-100 relative">
          <div className="w-20 h-20 md:w-48 md:h-48 rounded-full bg-blue-400 400 -translate-y-10 md:-translate-y-24 transform relative border-none z-0">

            <div className='absolute w-8 h-8 md:w-24 md:h-24  rounded-full bg-blue-100 left-6 bottom-6 md:left-12 md:bottom-12 z-10'></div>
          </div>
        </div>
        <Image className="absolute right-0 bottom-0" src="/home/9.png" alt="" width={160} height={150} />
      </section>

      <section className="relative py-12 px-4 md:py-16 md:px-12">


        <div className="max-w-7xl mx-auto">
          {/* white rounded card */}
          <div className="relative bg-white rounded-3xl p-8 md:p-14 shadow-xl overflow-hidden">
            {/* decorative faint circles inside */}
            <div className=" absolute -left-[2rem] top-0  -rotate-45 w-48 h-24 overflow-hidden bg-white ">
              <div className="w-48 h-48 rounded-full bg-blue-100 -translate-y-24 transform relative">

                <div className='absolute w-24 h-24 rounded-full bg-white left-12 top-12'></div>
              </div>
            </div>
            <div className=" absolute -right-[2rem] bottom-0  rotate-120 w-48 h-24 overflow-hidden bg-white ">
              <div className="w-48 h-48 rounded-full bg-blue-100 -translate-y-24 transform relative">

                <div className='absolute w-24 h-24 rounded-full bg-white left-12 top-12'></div>
              </div>
            </div>

            <div className="relative h-[140vh] md:h-[66vh] md:max-h-[32rem] grid grid-cols-1 md:grid-cols-4 md:items-center gap-6">
              {/* left small card */}
              <div className="flex flex-col items-end justify-start md:items-start  md:justify-end h-full">
                <div className="w-44 h-48 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl  p-2 flex flex-col justify-between text-center">
                  <div className="text-md font-medium p-2 indent-normal">Track Personal
                    Learning Progress</div>
                  <div className="text-xs  rounded-2xl  h-full  w-full flex items-center">
                    <Image src="/home/report.png" alt="report-image" width={1000} height={1000} className='h-[fit-content] w-full bg-transparent' />
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-center items-center relative h-full w-full">

                <div className=" w-full relative h-full">

                  <div className="absolute -left-[0rem] -right-[0rem] -top-[10rem]  md:-left-[12rem] md:-right-[8rem] md:-top-[3rem] transform rotate-[0deg] ">
                    <Image src="/home/black-s.png" alt="phone2" width={1000} height={1000} className="rounded-2xl w-full h-full md:hidden" />

                    <Image src="/home/black.png" alt="phone2" width={1000} height={1000} className="rounded-2xl w-full h-full hidden md:block" />
                  </div>
                </div>
              </div>

              {/* right small card */}
              <div className="flex flex-col md:items-end md:justify-start items-start justify-end h-full">
                <div className="w-44 h-44 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl  p-2 flex flex-col justify-between text-center">
                  <div className="text-md font-medium p-2">Complete Tasks In Just One Tap</div>
                  <div className="text-xs bg-blue-600 text-white rounded-2xl py-1 px-3 h-full  w-full flex items-center">Our system is designed to let users complete their tasks in easy and minimum steps </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>






      {/* School Dashboard Section */}
      <section className=' px-6'>

        <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 '>
          <div className='bg-white  rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden'>
            <h4 className='text-xl font-semibold my-8 text-center text-gray-700'>Dashboard Overview</h4>
            <Image
              className="w-full h-auto rounded-xl"
              src="/home/5.png"
              alt="School dashboard overview"
              width={600}
              height={400}
            />
          </div>
          <div className='bg-white  rounded-3xl shadow-lg hover:shadow-xl transition-shadow'>
            <h4 className='text-xl font-semibold my-8 text-center text-gray-700'>Performance Analytics</h4>
            <Image
              className="w-full h-auto rounded-xl"
              src="/home/4.png"
              alt="School dashboard analytics"
              width={600}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className='bg-[#0042D2] w-full mt-10 px-6 py-20'>
        <div className=' bg-white rounded-3xl max-w-7xl mx-auto p-8 md:p-16 shadow-2xl'>
          <h3 className='text-3xl md:text-5xl text-center font-extrabold mb-10 text-gray-800'>About Us</h3>

          <div className='flex flex-col md:flex-row gap-12 items-center mb-20'>
            <div className='flex-1'>
              <h4 className='text-3xl font-bold mb-5 text-[#0042D2]'>Practivoo is an app that helps:
              </h4>
              <ul className='list-disc ml-6 space-y-4 text-xl text-gray-700 leading-relaxed'>
                <li>teachers monitor their students' progress effortlessly.
                </li>
                <li>provides automatic reports showing minimum and maximum scores, common
                  mistakes, and overall performance.</li>

              </ul>
            </div>
            <div className='flex-1 flex justify-center'>
              <img className="w-full max-w-md rounded-4xl shadow-lg" src="/home/r1.png" alt="Teacher dashboard features" />
            </div>
          </div>

          <div className='flex flex-col md:flex-row-reverse gap-12 items-center'>
            <div className='flex-1'>
              <h4 className='text-3xl font-bold mb-5 text-[#0042D2]'>For students, Practivoo acts like:</h4>
              <ul className='list-disc ml-6 space-y-4 text-xl text-gray-700 leading-relaxed'>
                <li>A personal "teacher at home," available anytime</li>
                <li>Helping them pronounce words correctly with instant feedback</li>
                <li>Review what they learned in class, keeping practice consistent between lessons</li>
              </ul>
            </div>
            <div className='flex-1 flex justify-center'>
              <img className="w-full max-w-md rounded-4xl shadow-lg" src="/home/r2.png" alt="Student app features" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className=' relative bg-blue-100 px-6 md:px-10 py-20 overflow-hidden'>
        <div className='absolute -left-20 top-20 w-40 h-40 bg-blue-200 rounded-full opacity-40 blur-2xl'></div>
        <div className='absolute -right-20 bottom-40 w-48 h-48 bg-purple-200 rounded-full opacity-40 blur-2xl'></div>
        <Feature />
      </section>

      {/* Why Choose Practivoo Section */}
      <section className='max-w-7xl mx-auto mt-10 relative rounded-3xl  px-6 md:px-0   overflow-hidden'>
        <div className='  relative rounded-3xl bg-white py-10 px-4 overflow-hidden h- md:h-auto'>
          <div className="-right-4 top-1 w-20 h-10 rotate-40 md:right-10 md:top-0  md:rotate-0 md:w-48 md:h-24 overflow-hidden bg-white absolute hidde md:block">
            <div className="w-20 h-20  md:w-48 md:h-48 rounded-full bg-amber-400 -translate-y-10 md:-translate-y-24 transform relative">

              <div className='absolute w-8 h-8 md:w-24 md:h-24  rounded-full bg-white left-6 top-6 md:left-12 md:top-12'></div>
            </div>
          </div>
          <div className="-left-15 bottom-20  -rotate-90 w-48 h-24 overflow-hidden bg-white absolute">
            <div className="w-48 h-48 rounded-full bg-blue-200 -translate-y-24 transform relative">

              <div className='absolute w-24 h-24 rounded-full bg-white left-12 top-12'></div>
            </div>
          </div>

          <h2 className='text-3xl max-w-sm md:max-w-full md:text-5xl font-extrabold text-center mb-16 text-gray-800'>
            Why Choose Practivoo?
          </h2>

          <div className=' mx-10  grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className=' p- md:px-12 space-y-8 relative z-10'>
              <div className='bg-blue-100 rounded-2xl p-4 shadow-xl'>

                <p className='font-bold leading-relaxed '>
                  Fully automated homework assignment and correction</p>
              </div>

              <div className='bg-blue-50 rounded-2xl p-4 shadow-lg'>
                <p className='leading-relaxed'>
                  <span className='font-bold'>Engaging and varied exercise types </span>
                  (fill-in-the-gaps, find the mistakes, match the
                  pictures, multiple choice, sentence completion, word order tasks)
                </p>
              </div>
              <div className='bg-blue-50 rounded-2xl p-4'>
                <p className='font-bold leading-relaxed'>
                  100% customised content aligned with each school's syllabus, set up for the entire
                  school year
                </p>
              </div>
            </div>

            <div className='flex justify-center  z-10 md:hidden'>

              <img
                className=" w-full max-w-xs  rounded-[3rem] transform hover:scale-105 transition-transform"
                src="/home/3.png"
                alt="Practivoo mobile app interface"
              />

            </div>
          </div>
        </div>
      </section>
      <section className='max-w-7xl mx-auto  flex justify-end relative z-10 h-1 hidden md:block'>
        <div className='relative w-full flex justify-end'>
          <div className='  relative p-12  -top-[10rem] w-[28rem] h-[30rem] bg-blue-100 mr-20 rounded-full  flex justify-center '>
            <img
              className="relative -top-[12rem] w-auto h-[30rem]  bg-gradient-to-brfrom-blue-400to-blue-600   transformhover:scale-105transition-transform   "
              src="/home/3.png"
              alt="Practivoo mobile app interface"
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className='relative bg-blue-100 px-6md:px-10 py-20'>
        <div className=' bg-white  p-8 md:p-16 text-start'>
          <div className='max-w-7xl mx-auto  mb-6'>
            <div className=' flex justify-start  mb-6'>
              <Image
                className='w-auto h-16'
                src="/home/logo.png"
                alt="Practivoo"
                width={640}
                height={640}
              />
            </div>
            <h2 className='text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 leading-tight'>
              Where Schools, Teachers, and<br />
              Students Grow Together
            </h2>
            <div className='flex flex-col sm:flex-row justify-start items-center gap-4 mt-10'>
              <Image
                src="/home/10.png"
                alt="Get it on Google Play"
                width={150}
                height={50}
                className='hover:scale-105 transition-transform cursor-pointer'
              />
              <Image
                src="/home/11.png"
                alt="Download on App Store"
                width={150}
                height={50}
                className='hover:scale-105 transition-transform cursor-pointer'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className='bg-[#0042D2] px-6 md:px-10 py-20'>
        <div className=' max-w-7xl mx-auto '>
          <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-12 text-white'>Pricing</h2>

          <div className='md:bg-white bg-transparent md:shadow-2xl rounded-3xl grid grid-cols-1 font-bold lg:grid-cols-2 md:gap-0 gap-8'>
            {/* For Schools */}
            <div className='bg-white rounded-3xl p-8 md:p-10 '>
              <h3 className='text-5xl  mb-6 text-gray-800'>For Schools</h3>
              <p className='text-lg  mb-6 text-gray-700 '>
                Contact us for a customized quote tailored to your school's size and needs.
              </p>
              <h4 className='font-bold text-lg mb-6'>What's Included</h4>

              <ul className='space-y-4 mb-8'>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Full access to all features for teachers, students, and administrators</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Unlimited content creation and assignment tracking</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Dedicated support and regular training sessions</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Analytics dashboard for school-wide performance monitoring</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Integration with existing school management systems</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Custom branding options for a personalized experience</p>
                </li>
              </ul>
            </div>

            {/* For Individual */}
            <div className='relative  bg-white font-bold rounded-3xl p-8 md:p-10  '>
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-1/2 bg-gray-500 rounded  hidden md:block" aria-hidden="true"></span>
              <h3 className='text-5xl font-bold mb-6 text-gray-800'>For Individual</h3>
              <p className='text-lg mb-6 text-gray-700'>
                <span className='text-2xl  text-[#0042D2]'> €120</span> (annually / student)
              </p>
              <h4 className='font-bold text-lg mb-6'>What's Included</h4>

              <ul className='space-y-4 mb-8'>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Access to all interactive lesson activities (free 4 quizzes)</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Ability to track your child's progress in real-time</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Instant feedback and autocorrection on all exercises</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Access to progress reports showing areas of improvement</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Gamification elements (badges, leaderboards)</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Personalized progress monitoring for better learning outcomes</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>One-on-one assistance and parental guides</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Easy access to personalized content through subscription</p>
                </li>
              </ul>

              <div className='flex justify-end'>
                <a
                  href='/'
                  className='flex items-center gap-2 border border-[#0042D2] text-[#0042D2] pr-4 pl-1 py-1 rounded-full hover:bg-[#0042D2] hover:text-white transition-all duration-300 group relative overflow- hidden'
                >
                  <span className='relative z-10 bg-[#0042D2] text-white rounded-full p-2 group-hover:scale-110 transition-transform duration-300'>
                    <ArrowRight size={20} className='group-hover:translate-x-1 transition-transform duration-300' />
                  </span>
                  <span className='text-sm md:text-base relative z-10'>Subscribe Now </span>

                  {/* Animated background */}
                  <div className='absolute inset-0 bg-[#0042D2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'></div>
                </a>
                <a
                  href='/'
                  className='flex items-center gap-2 border border-[#0042D2] text-[#0042D2] pr-4 pl-1 py-1 rounded-full hover:bg-[#0042D2] hover:text-white transition-all duration-300 group relative overflow-hidden'
                >
                  <span className='relative z-10 group-hover:bg-white group-hover:text-[#0042D2] bg-[#0042D2] text-white rounded-full p-2 '>
                    <ArrowRight className='h-5 w-5 ' />
                  </span>
                  <span className='text-sm  relative z-10'>Subscribe Now </span>

                  {/* Animated background */}
                  <div className='absolute inset-0 bg-[#0042D2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <FAQSection />

      {/* Let's Get In Touch Section */}
      <section id="contact-us" className=' px-6 md:px-10 py-20'>
        <div className='max-w-2xl mx-auto'>
          <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-4 text-gray-800'>
            Let's Get In Touch
          </h2>
          <p className='text-center text-gray-600 text-lg mb-2'>
            We'd love to learn more about you and how we can help you.
          </p>

          <div className='bg-whiterounded-3xl p-8 md:p-12 '>
            <h3 className='text-2xl font-bold text-center mb-8 text-gray-800'>Fill Up The Form</h3>

            <form onSubmit={(e) => SendInquery(e)} className='space-y-6'>
              <div>
                <input
                  type='text'
                  placeholder='Enter your name'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full px-6 py-4 border-2 border-gray-600 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 transition-colors'
                />
              </div>

              <div>
                <input
                  type='email'
                  placeholder='Enter your email'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className='w-full px-6 py-4 border-2 border-gray-600 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 transition-colors'
                />
              </div>

              <div>
                <textarea
                  placeholder='Enter Your Message'
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className='w-full px-6 py-4 border-2 border-gray-600 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 resize-none transition-colors'
                ></textarea>
              </div>

              <div className='cursor-pointer flex justify-center pt-4'>

                <div

                  className='flex cursor-pointer items-center gap-2 border border-[#0042D2] text-[#0042D2] pr-4 pl-1 py-1 rounded-full hover:bg-[#0042D2] hover:text-white transition-all duration-300 group relative overflow-hidden'
                >
                  <span className='relative z-10 group-hover:bg-white group-hover:text-[#0042D2] bg-[#0042D2] text-white rounded-full p-2 md:p-2 '>
                    <ArrowRight className='h-5 w-5 md:h-5 md:w-5 ' />
                  </span>
                  <button type="submit" className='text-sm cursor-pointer md:text-sm  relative z-10'>Submit Form</button>

                  {/* Animated background */}
                  <div className='absolute inset-0 bg-[#0042D2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'></div>
                </div>
              </div>
            </form>
          </div>
        </div >
      </section >

      {/* Footer */}
      < footer className='bg-[#0042D2] text-white px-6 md:px-10 py-12' >
        <div className='max-w-7xl mx-auto '>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-8'>
            {/* Brand Section */}
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <Image
                  src="/home/logo-w.png"
                  alt="Practivoo Logo"
                  width={150}
                  height={150}
                  className=''
                />
                {/* <h3 className='text-2xl font-bold'>Practivoo</h3> */}
              </div>
              <p className='text-blue-100 text-sm leading-relaxed mb-6'>
                Empowering education through innovative technology. Where schools, teachers, and students grow together.
              </p>
              <div className='flex gap-4'>
                <a href="https://play.google.com/store/apps/details?id=practivoo&hl=en_IN&gl=US" target="_blank" rel="noopener noreferrer">

                  <Image

                    src="/home/10.png"
                    alt="Get it on Google Play"
                    width={120}
                    height={40}
                    className='cursor-pointer hover:scale-105 transition-transform'
                  />
                </a>

                <a href="https://apps.apple.com/us/app/practivoo/" target="_blank" rel="noopener noreferrer">

                  <Image
                    src="/home/11.png"
                    alt="Download on App Store"
                    width={120}
                    height={40}
                    className='cursor-pointer hover:scale-105 transition-transform'
                  />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className='text-lg font-bold mb-4'>Company</h4>
              <ul className='space-y-3'>
                <li><a href='#about-us' className='text-blue-100 hover:text-white transition-colors'>About Us</a></li>
                <li><a href='#features' className='text-blue-100 hover:text-white transition-colors'>Features</a></li>
                <li><a href='#pricing' className='text-blue-100 hover:text-white transition-colors'>Prices</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className='text-lg font-bold mb-4'>Support</h4>
              <ul className='space-y-3'>
                <li><a href='#faq-section' className='text-blue-100 hover:text-white transition-colors'>FAQ</a></li>
                <li><a href='#contact-us' className='text-blue-100 hover:text-white transition-colors'>Contact Us</a></li>
              </ul>
            </div>
            <div >
              <h4 className='text-lg font-bold mb-4'>Follow Us</h4>
              <div className='flex gap-4'>
                <a href='https://x.com/' className='text-blue-100 hover:text-white transition-colors'>
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                  </svg>
                </a>
                <a href='https://www.facebook.com/' className='text-blue-100 hover:text-white transition-colors'>
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' />
                  </svg>
                </a>
                <a href='https://www.instagram.com/' className='text-blue-100 hover:text-white transition-colors'>
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='border-t border-blue-400 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-blue-100 text-sm'>
              © {new Date().getFullYear()} Practivoo. All rights reserved.
            </p>
            <p className='flex gap-4 text-blue-100 text-sm'>
              Design & Developed By Softkingo.
            </p>
          </div>
        </div>
      </footer >
    </div >
  );
}