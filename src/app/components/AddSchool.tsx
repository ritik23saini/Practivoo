import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { MdEmail, MdLock, MdPassword } from 'react-icons/md';
import { getCountries } from '../constants/countryList';

type AddSchoolProps = {
    createForm: any;
    setCreateForm: (form: any) => void;
    setaddSchoolstate: (state: boolean) => void;
    handleCreate: () => Promise<any>;
};

const AddSchool = ({ createForm, setCreateForm, setaddSchoolstate, handleCreate }: AddSchoolProps) => {

    const { countryName, countrycode } = getCountries();
    const router = useRouter();
    const [addedSchools, setAddedSchools] = useState<
        { id: string; name: string }[]
    >([]);

    const handleChange = (field: string, value: string) => {
        setCreateForm({ ...createForm, [field]: value });
        console.log(createForm);
    };

    const handleAddSchool = async () => {
        const newSchool = await handleCreate();
        if (newSchool) {
            setAddedSchools((prev) => [
                ...prev,
                { id: newSchool._id, name: newSchool.name },
            ]);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-5 mt-5">
            <div className="w-full">
                <div className="flex gap-2">
                    <p
                        className="cursor-pointer text-xl"
                        onClick={() => {
                            setaddSchoolstate(false);
                            router.refresh();
                        }}
                    >
                        Schools
                    </p>
                    <ChevronRight />
                    <p className="text-2xl font-bold">Add New school</p>
                </div>

                <div className="rounded-2xl p-6 space-y-6">
                    {/* School Name */}
                    <div>
                        <label className="block text-md font-semibold mb-1">School Name</label>
                        <input
                            type="text"
                            placeholder="Enter school name"
                            value={createForm?.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Phone + Country Code */}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-3">
                        <div>
                            <label className="block text-md font-semibold my-2">Code</label>
                            <select
                                value={createForm?.code}
                                onChange={(e) => handleChange("code", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >

                                {countrycode.map((code, index) =>
                                    <option key={index} value={code[1]}>{code[0]} ({code[1]})</option>)
                                }
                            </select>
                        </div>
                        <div className="lg:col-span-2 mt-2">
                            <label className="block text-md font-semibold mb-1">
                                Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your number"
                                value={createForm?.phone || ""}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Based In */}
                    <div>
                        <label className="block text-md font-semibold mb-1">Based In</label>
                        <select
                            value={createForm?.country}
                            onChange={(e) => handleChange("country", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {countryName.map((country, index) =>
                                <option key={index} value={country}>{country}</option>)
                            }

                        </select>
                    </div>

                    {/* Email */}
                    <div>

                        <label className="block text-md font-semibold mb-1">Email</label>
                        <div className="w-full  flex gap-2 items-center border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <MdEmail />
                            <input
                                type="email"
                                placeholder="school@example.com"
                                value={createForm?.email || ""}
                                onChange={(e) => handleChange("email", e.target.value)}

                            />
                        </div>

                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-md font-semibold mb-1">Password</label>
                        <div className="w-full  flex gap-2 items-center border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <MdLock /><input
                                type="password"
                                placeholder="Enter Password"
                                value={createForm?.password || ""}
                                onChange={(e) => handleChange("password", e.target.value)}

                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-md font-semibold mb-1">Date Joined</label>
                            <input
                                type="date"
                                value={createForm?.startDate || ""}
                                onChange={(e) => handleChange("startDate", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-md font-semibold mb-1">End Date</label>
                            <input
                                type="date"
                                value={createForm?.endDate || ""}
                                onChange={(e) => handleChange("endDate", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddSchool}
                            className="w-full text-black p-2 bg-slate-200 rounded-lg font-medium hover:bg-blue-100 transition"
                        >
                            Add School
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar with newly added schools */}

            <div className=" bg-white">
                {addedSchools.length > 0 ? (
                    <div className="max-w-md rounded-2xl p-4 mt-6">

                        <div>
                            <h2 className="text-lg font-semibold mb-4">New Schools Added</h2>
                            <div className="space-y-3">
                                {addedSchools.map((school) => (
                                    <div
                                        key={school.id}
                                        className="flex items-center justify-between border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
                                            <span className="font-medium text-gray-800">{school.name}</span>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <ChevronRight size={20} onClick={() => {
                                                setaddSchoolstate(false);
                                                router.refresh();
                                            }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>) : <p className='text-center m-10 font-extrabold text-xl'>No School added</p>}
            </div>

        </div>
    );
};

export default AddSchool;
