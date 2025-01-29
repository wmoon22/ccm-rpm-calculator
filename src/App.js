import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Calculator = () => {
  const [patientCount, setPatientCount] = useState(100);
  const [ccmParticipation, setCcmParticipation] = useState(50);
  const [rpmParticipation, setRpmParticipation] = useState(35);
  
  const [add20MinPercentage, setAdd20MinPercentage] = useState(20);
  const [add20MinTwicePercentage, setAdd20MinTwicePercentage] = useState(10);
  const [complexCCMPercentage, setComplexCCMPercentage] = useState(3);
  const [complexCCMAddPercentage, setComplexCCMAddPercentage] = useState(1);
  const [completedCareRate, setCompletedCareRate] = useState(97);
  const [rpmDeviceReadingsPercentage, setRPMDeviceReadingsPercentage] = useState(75);

  const ccmCodes = {
    '99490': { rate: 60.49, name: 'Initial 20 minutes (clinical staff)' },
    '99439': { rate: 45.93, name: 'Each additional 20 minutes (clinical staff)' },
    '99487': { rate: 131.65, name: 'Complex CCM initial 60 minutes' },
    '99489': { rate: 70.52, name: 'Complex CCM each additional 30 minutes' },
  };

  const rpmCodes = {
    '99453': { rate: 19.73, name: 'Setup and patient education' },
    '99454': { rate: 43.02, name: 'Device supply with daily recordings' },
    '99457': { rate: 48.14, name: 'Initial 20 minutes of treatment management' },
    '99458': { rate: 38.49, name: 'Each additional 20 minutes' }
  };

  const calculateMonthlyRevenue = (ccmPatients, rpmPatients) => {
    let ccmRevenue = 0;
    let rpmRevenue = 0;

    const completedCCMPatients = Math.round(ccmPatients * (completedCareRate / 100));
    const completedRPMPatients = Math.round(rpmPatients * (completedCareRate / 100));

    // CCM calculations
    ccmRevenue += completedCCMPatients * ccmCodes['99490'].rate;
    
    const add20MinPatients = Math.round(completedCCMPatients * (add20MinPercentage / 100));
    ccmRevenue += add20MinPatients * ccmCodes['99439'].rate;
    
    const add20MinTwicePatients = Math.round(completedCCMPatients * (add20MinTwicePercentage / 100));
    ccmRevenue += add20MinTwicePatients * ccmCodes['99439'].rate * 2;
    
    const complexCCMPatients = Math.round(completedCCMPatients * (complexCCMPercentage / 100));
    ccmRevenue += complexCCMPatients * ccmCodes['99487'].rate;
    
    const complexCCMAddPatients = Math.round(completedCCMPatients * (complexCCMAddPercentage / 100));
    ccmRevenue += complexCCMAddPatients * ccmCodes['99489'].rate;

    // RPM calculations
    rpmRevenue += completedRPMPatients * rpmCodes['99453'].rate;
    const rpmDevicePatients = Math.round(completedRPMPatients * (rpmDeviceReadingsPercentage / 100));
    rpmRevenue += rpmDevicePatients * rpmCodes['99454'].rate;
    rpmRevenue += completedRPMPatients * rpmCodes['99457'].rate;
    const rpmAdd20MinPatients = Math.round(completedRPMPatients * (add20MinPercentage / 100));
    rpmRevenue += rpmAdd20MinPatients * rpmCodes['99458'].rate;

    return { ccmRevenue, rpmRevenue, totalRevenue: ccmRevenue + rpmRevenue };
  };

  const revenue = useMemo(() => {
    const ccmPatients = Math.round(patientCount * (ccmParticipation / 100));
    const rpmPatients = Math.round(patientCount * (rpmParticipation / 100));
    const { ccmRevenue, rpmRevenue, totalRevenue } = calculateMonthlyRevenue(ccmPatients, rpmPatients);
    const annualRevenue = totalRevenue * 12;

    return {
      ccmPatients,
      rpmPatients,
      ccmRevenue,
      rpmRevenue,
      monthlyRevenue: totalRevenue,
      annualRevenue,
    };
  }, [patientCount, ccmParticipation, rpmParticipation, add20MinPercentage, add20MinTwicePercentage, complexCCMPercentage, complexCCMAddPercentage, completedCareRate, rpmDeviceReadingsPercentage]);

  const chartData = useMemo(() => {
    const rampRates = [0.1, 0.25, 0.5, 0.75, 1];
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const rampRate = rampRates[Math.min(Math.floor(i / 2), 4)];
      const ccmPatients = Math.round(patientCount * (ccmParticipation / 100) * rampRate);
      const rpmPatients = Math.round(patientCount * (rpmParticipation / 100) * rampRate);
      const { totalRevenue } = calculateMonthlyRevenue(ccmPatients, rpmPatients);
      return {
        month: `Month ${month}`,
        revenue: totalRevenue,
      };
    });
  }, [patientCount, ccmParticipation, rpmParticipation, add20MinPercentage, add20MinTwicePercentage, complexCCMPercentage, complexCCMAddPercentage, completedCareRate, rpmDeviceReadingsPercentage]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Medicare CCM & RPM Revenue Calculator</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block mb-2">Total Medicare Patients</label>
            <input
              type="number"
              value={patientCount}
              onChange={(e) => setPatientCount(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">CCM Participation Rate (%)</label>
            <input
              type="number"
              value={ccmParticipation}
              onChange={(e) => setCcmParticipation(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">RPM Participation Rate (%)</label>
            <input
              type="number"
              value={rpmParticipation}
              onChange={(e) => setRpmParticipation(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Detailed Calculation Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Additional 20 min (%)</label>
              <input
                type="number"
                value={add20MinPercentage}
                onChange={(e) => setAdd20MinPercentage(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Additional 20 min twice (%)</label>
              <input
                type="number"
                value={add20MinTwicePercentage}
                onChange={(e) => setAdd20MinTwicePercentage(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Complex CCM (%)</label>
              <input
                type="number"
                value={complexCCMPercentage}
                onChange={(e) => setComplexCCMPercentage(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Complex CCM additional (%)</label>
              <input
                type="number"
                value={complexCCMAddPercentage}
                onChange={(e) => setComplexCCMAddPercentage(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Completed Care Rate (%)</label>
              <input
                type="number"
                value={completedCareRate}
                onChange={(e) => setCompletedCareRate(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">RPM Device Readings (%)</label>
              <input
                type="number"
                value={rpmDeviceReadingsPercentage}
                onChange={(e) => setRPMDeviceReadingsPercentage(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Revenue Projection</h2>
          <ul className="space-y-2">
            <li>CCM Patients: {revenue.ccmPatients}</li>
            <li>RPM Patients: {revenue.rpmPatients}</li>
            <li>Monthly CCM Revenue: ${revenue.ccmRevenue.toFixed(2)}</li>
            <li>Monthly RPM Revenue: ${revenue.rpmRevenue.toFixed(2)}</li>
            <li>Total Monthly Revenue: ${revenue.monthlyRevenue.toFixed(2)}</li>
            <li className="font-bold">Annual Revenue: ${revenue.annualRevenue.toFixed(2)}</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">12-Month Revenue Projection</h2>
          <div className="mb-4">
            <p className="mb-2">Enrollment Ramp Rate:</p>
            <ul className="list-disc pl-5">
              <li>Months 1-2: 10% enrollment</li>
              <li>Months 3-4: 25% enrollment</li>
              <li>Months 5-6: 50% enrollment</li>
              <li>Months 7-8: 75% enrollment</li>
              <li>Months 9-12: 100% enrollment</li>
            </ul>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
