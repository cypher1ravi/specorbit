import { Github } from 'lucide-react';

export default function Login() {
  const handleGithubLogin = () => {
    // Redirect the browser to the Backend OAuth endpoint
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SpecOrbit 🚀</h1>
          <p className="mt-2 text-sm text-gray-600">
            Stop writing docs manually. Sync them with your code.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                MVP Version
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}