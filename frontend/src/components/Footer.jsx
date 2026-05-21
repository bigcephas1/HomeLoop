import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src="/logo.svg" alt="HomeLoop" className="h-6 w-auto" />
            <span className="font-bold text-xl text-white">HomeLoop</span>
          </div>
          <p className="text-sm">
            Safe, transparent, and verified housing platform.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/license" className="hover:text-white">
                License
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <p className="text-sm">support@homeloop.com</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Follow Us</h4>
          <div className="flex space-x-4 text-2xl">
            <a href="#" className="hover:text-white transition">
              📘
            </a>
            <a href="#" className="hover:text-white transition">
              🐦
            </a>
            <a href="#" className="hover:text-white transition">
              📷
            </a>
            <a href="#" className="hover:text-white transition">
              💬
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} HomeLoop. All rights reserved.
      </div>
    </footer>
  );
}
