import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  GitBranch,
  UserRoundCheck,
  LineChart,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
  Users,
  ChartNoAxesCombined,
  CalendarClock,
} from "lucide-react";
import BgAnimation from "../components/shared/BgAnimation";
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from "./motionVariants";

const HomePage = () => {
  return (
    <div className="relative">
      <BgAnimation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-transparent">
        <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8 sm:py-20 lg:py-24 pt-16 px-4 pb-16">
          <motion.div
            className="grid lg:grid-cols-2 gap-10 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Left Content */}
            <motion.div className="flex flex-col gap-6" variants={fadeLeft}>
              <div className="inline-flex items-center gap-2 bg-pran-red/10 text-pran-red px-3 py-1.5 rounded-full w-max text-xs font-medium">
                <TrendingUp className="w-4 h-4" />
                Sales Management Platform
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-dark">
                Sales Management System
              </h1>
              <p className="text-gray-medium text-base sm:text-lg leading-7">
                Empowering Territorial Managers and Sales Executives with real-time insights,
                streamlined approvals, and performance-driven dashboards.
              </p>
              <motion.div className="flex flex-wrap items-center gap-3" variants={fadeUp}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-5 py-3 text-sm font-medium tracking-tight hover:bg-[#b72828] transition"
                >
                  <UserRoundCheck className="w-4 h-4" /> Sign in to your dashboard
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div className="relative" variants={fadeRight}>
              <motion.div
                className="aspect-[4/3] rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 120 }}
              >
                <img src="/hero.jpg" className="w-full h-full object-cover" alt="PRAN team" />
              </motion.div>

              {/* Manager card */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl border border-black/10 shadow-sm p-4 w-64"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden">
                    <img src="/mlogo.jpg" alt="Manager" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-dark tracking-tight">
                      Territorial Manager
                    </div>
                    <div className="text-gray-medium">Real-time Operations</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <motion.div
                    className="rounded-lg bg-gray-light py-2 flex flex-col items-center"
                    whileHover={{ y: -5 }}
                  >
                    <Users className="w-4 h-4" />
                    <div className="text-[11px] text-gray-medium">Teams</div>
                  </motion.div>
                  <motion.div
                    className="rounded-lg bg-gray-light py-2 flex flex-col items-center"
                    whileHover={{ y: -5 }}
                  >
                    <ChartNoAxesCombined className="w-4 h-4" />
                    <div className="text-[11px] text-gray-medium">Target</div>
                  </motion.div>
                  <motion.div
                    className="rounded-lg bg-gray-light py-2 flex flex-col items-center"
                    whileHover={{ y: -5 }}
                  >
                    <CalendarClock className="w-4 h-4" />
                    <div className="text-[11px] text-gray-medium">Requests</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative bg-transparent py-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {[
            {
              icon: <LineChart className="w-5 h-5" />,
              title: "Sales Intelligence",
              text: "Granular KPIs, trends, and targets with crisp charts and progress.",
              color: "bg-pran-blue/10 text-pran-blue",
            },
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              title: "Approvals & Leaves",
              text: "Approve or reject requests seamlessly with audit-ready logs.",
              color: "bg-pran-green/10 text-pran-green",
            },
            {
              icon: <CloudUpload className="w-5 h-5" />,
              title: "Cloud Files",
              text: "Cloud-ready uploads for images and reports, plus downloads.",
              color: "bg-pran-yellow/10 text-pran-yellow",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-black/10 bg-white p-5 hover:shadow-md transition"
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg grid place-items-center ${card.color}`}>
                  {card.icon}
                </div>
                <div className="font-medium tracking-tight">{card.title}</div>
              </div>
              <p className="text-sm text-gray-medium mt-2">{card.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* System Flow */}
      <section id="flow" className="bg-transparent pt-10 pb-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-dark" variants={fadeUp}>
            How the System Works
          </motion.h2>
          <motion.p className="text-gray-medium max-w-2xl mx-auto mt-3" variants={fadeUp}>
            From request initiation to approvals and performance monitoring — everything is seamless,
            structured, and transparent.
          </motion.p>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <GitBranch className="w-8 h-8 text-pran-red mb-3" />,
                title: "Requests Flow",
                text: "Sales executives raise requests, managers approve/reject with instant notifications.",
              },
              {
                icon: <Users className="w-8 h-8 text-pran-blue mb-3" />,
                title: "Team Collaboration",
                text: "Managers assign, monitor, and support their teams with clarity and accountability.",
              },
              {
                icon: <ChartNoAxesCombined className="w-8 h-8 text-pran-green mb-3" />,
                title: "Performance Tracking",
                text: "Real-time dashboards and KPIs keep everyone aligned on targets and progress.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white border border-black/10 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center"
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {item.icon}
                <h3 className="font-medium tracking-tight text-gray-dark">{item.title}</h3>
                <p className="text-sm text-gray-medium mt-1">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-transparent text-black py-20">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Ready to streamline your sales operations?
          </h2>
          <p className="max-w-2xl mx-auto mt-3 text-black/80">
            Join hundreds of managers already improving their approval flow and team performance.
          </p>
          <motion.div className="mt-8" whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-pran-red font-medium tracking-tight hover:bg-pran-red hover:text-white hover:shadow transition border-2 border-pran-red"
            >
              <ArrowRight className="w-5 h-5" /> Get Started Today
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
