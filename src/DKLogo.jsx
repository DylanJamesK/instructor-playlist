const DKLogo = () => {
  return (
    <div className="absolute top-0 right-0 p-10 pointer-events-none">
      <div className="flex items-center space-x-3">
        <span className="text-black text-default md:text-xl whitespace-nowrap">Designed by Dylan J Kerr</span>
        <div className="w-4 h-6 md:w-8 md:h-8 overflow-hidden">
          <svg
            className="w-full h-full fill-current text-black"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1300.75439 2242"
          >
            <path d="M0,1522.98233c321.28064,0,581.73675-260.45598,581.73675-581.73675H0v581.73675Z" />
            <path d="M581.73675,941.24558h359.50884C941.24558,421.41296,519.83262,0,0,0v359.50884c321.28064,0,581.73675,260.45604,581.73675,581.73675Z" />
            <path d="M1126.71802,1591.62091c110.67786-191.32544,174.03638-413.44879,174.03638-650.37531h-359.50879c0,519.83258-421.41296,941.24554-941.24561,941.24554v359.50885c338.22919,0,646.29559-129.1076,877.63916-340.71161v.00024c41.05151,105.6543,63.60645,220.54639,63.60645,340.71136h359.50879c0-236.92542-63.3573-459.0495-174.03528-650.37732l-.0011-.00177Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DKLogo;
