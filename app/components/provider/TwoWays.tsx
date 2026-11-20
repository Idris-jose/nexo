import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "../ui/FadeIn";

export default function TwoWays() {
  return (
    <section className="bg-white py-20">
      <FadeIn direction="up"  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-4">
            Find opportunities that work for you.
          </h2>
          <p className="text-gray-500 text-lg ">
            Explore available jobs, respond to customer requests and connect with people who need your skills.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 - Post a Gig */}
          <FadeIn direction="left"  className="relative rounded-3xl overflow-hidden group bg-[#F3F5F8] border border-gray-100 hover:shadow-xl transition-shadow">
            {/* Image Placeholder */}
            <div className="p-5">
            <Image src="/Nexoimages/Image_ Bid on posted gigs.png" alt="post" width={700} height={700}/>
            </div>
            {/* Content */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[#0B1F5C] mb-3">Bid on posted gigs</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Discover jobs posted by customers, review the details and submit a bid for the work you're interested in.
              </p>
              
            </div>
          </FadeIn>

          {/* Card 2 - Find a Provider */}
          <FadeIn direction="right" className="relative rounded-3xl overflow-hidden group bg-[#F3F5F8] border border-gray-100 hover:shadow-xl transition-shadow">
            {/* Image Placeholder */}
            <div className="p-5">
            <Image src="/Nexoimages/Find what you need.png" alt="post" width={700} height={700}/>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[#0B1F5C] mb-3">Get discovered by customers</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Make your services available to customers who are searching for professionals and requesting services directly.
              </p>
             
            </div>
          </FadeIn>
        </div>
      </FadeIn >
    </section>
  );
}

