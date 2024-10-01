import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faBell, faChartLine, faCloud, faUsers } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';

function HomePage() {
  const users = [
    { name: 'Khalil', feedback: "I can't believe I used sticky notes before this. Now my cat doesn't eat my to-do lists!" },
    { name: 'Mouad', feedback: "If only this app could also help me find my car keys... but hey, my tasks are on point!" },
    { name: 'Rajaa', feedback: "Kabo-Todo is so good, I actually started completing tasks just to see the confetti." }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-b from-secondary to-primary text-white pt-20">
        <motion.div 
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
        Simplify Your, <Typewriter options={{ strings: [' Task Management', ' Work', ' Life'], autoStart: true, loop: true, delay: 50 }}/>
        </motion.div>
        <p className="text-xl mb-8 text-center px-8">
          Kabo-Todo is the ultimate tool to help you keep track of tasks, manage priorities, and stay productive.
          With seamless Dropbox integration, user notifications, and powerful performance analytics, you’ll have 
          everything you need to stay on top of your work.
        </p>
        <motion.div 
          className="bg-accent text-white px-6 py-3 rounded-full font-semibold shadow-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/my-tasks">Go to My Tasks</Link>
        </motion.div>
      </section>

      {/* Detailed Explanation Section */}
      <section className="py-16 bg-white text-dark">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Why Kabo-Todo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FontAwesomeIcon icon={faTasks} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Task Tracking</h3>
              <p>
                Kabo-Todo provides a robust task tracking system that allows you to create, edit, and manage tasks effortlessly.
                You can categorize tasks, set due dates, and get notifications about upcoming deadlines. Whether you're working
                on a team or individually, you’ll always know what needs to be done next.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FontAwesomeIcon icon={faBell} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Notifications</h3>
              <p>
                Stay informed with real-time notifications about task updates, deadlines, and important events. Kabo-Todo sends
                timely alerts so you never miss an important task. Notifications are fully customizable to ensure that you receive
                only the most relevant information.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <FontAwesomeIcon icon={faChartLine} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p>
                Kabo-Todo gives you access to insightful analytics that show how you or your team are performing. View task
                completion rates, analyze bottlenecks, and improve your productivity. The dashboard provides clear data on your
                progress over time.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FontAwesomeIcon icon={faCloud} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dropbox Integration</h3>
              <p>
                Seamlessly integrate Dropbox into your task management workflow. Easily attach and manage files from your
                Dropbox account, making it simple to keep track of project assets. File synchronization ensures that your documents
                are always up to date.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100 text-dark">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {users.map((user, index) => (
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg"
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <p className="italic">"{user.feedback}"</p>
                <h3 className="font-bold mt-4">{user.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white text-dark">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FontAwesomeIcon icon={faTasks} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manage Multiple Projects</h3>
              <p>
                Keep all your projects organized in one place. With Kabo-Todo, you can switch between projects effortlessly and
                track progress across teams and departments.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <FontAwesomeIcon icon={faUsers} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaborate with Teams</h3>
              <p>
                Work together with your team on shared tasks. Assign tasks, track team performance, and collaborate seamlessly.
                Kabo-Todo ensures everyone stays in sync, no matter where they are.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FontAwesomeIcon icon={faChartLine} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p>
                Gain insights into how well you or your team are performing. View task completion statistics and identify areas for
                improvement, helping you optimize workflows for maximum efficiency.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-dark text-gray-400 text-center">
        <p>&copy; 2024 Kabo-Todo. All rights reserved.</p>
        <Link to="/my-tasks" className="hover:text-primary transition duration-300">Go to My Tasks</Link>
      </footer>
    </div>
  );
}

export default HomePage;
