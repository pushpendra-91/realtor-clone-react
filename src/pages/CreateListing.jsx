import React, { useState } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify'

export default function CreateListing() {
    const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "rent",
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        description: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        latitude: 0,
        longitude: 0,
        images: {},
    });

    const { type, name, bedrooms, bathrooms, parking, furnished, address, description, offer, regularPrice, discountedPrice, latitude, longitude, images } = formData;

    const onChange = (e) => {
        let boolean = null;
        if (e.target.value === "true")
            boolean = true;

        if (e.target.value === "false")
            boolean = false;

        //Image Files
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }))
        }

        // Text/Boolean/Number
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }))
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error("Discounted Price should be less than Regular Price");
            return;
        }
        if (images.length > 6) {
            setLoading(false);
            toast.error("Maximum 6 images are allowed");
            return;
        }

        let geoLocation = {}
        let location
        if (geoLocationEnabled) {

        }
    }

    if (loading) {
        return <Spinner />;
    }
    return (
        <main className='max-w-md px-2 mx-auto'>
            <h1 className='text-3xl text-center mt-6 font-bold'>Create a Listing</h1>
            <form onSubmit={onSubmit}>
                <p className='text-lg mt-6 font-semibold'>Sell / Rent</p>
                <div className='flex '>
                    <button type='button' id='type' value='sale' onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${type === 'rent' ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Sell</button>

                    <button type='button' id='type' value='rent' onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${type === 'sale' ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Rent</button>
                </div>
                <p className='text-lg mt-6 font-semibold'>Name</p>
                <input type='text' id='name' value={name} onChange={onChange} placeholder='Name' maxLength='32' minLength='4' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                <div className='flex space-x-6 mb-6 '>
                    <div>
                        <p className='text-lg font-semibold'>Beds</p>
                        <input type='number' id='bedrooms' value={bedrooms} onChange={onChange} placeholder='Beds' min='1' max='20' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                    </div>
                    <div>
                        <p className='text-lg font-semibold'>Baths</p>
                        <input type='number' id='bathrooms' value={bathrooms} onChange={onChange} placeholder='Beds' min='1' max='20' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                    </div>
                </div>
                <p className='text-lg mt-6 font-semibold'>Parking Spot</p>
                <div className='flex '>
                    <button type='button' id='parking' value={true} onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!parking ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Yes</button>

                    <button type='button' id='parking' value={false} onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${parking ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>No</button>
                </div>
                <p className='text-lg mt-6 font-semibold'>Furnished</p>
                <div className='flex '>
                    <button type='button' id='furnished' value={true} onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Sell</button>

                    <button type='button' id='furnished' value={false} onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Rent</button>
                </div>
                <p className='text-lg mt-6 font-semibold'>Address</p>
                <textarea type='text' id='address' value={address} onChange={onChange} placeholder='Address' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                {!geoLocationEnabled && (
                    <div className='flex space-x-6 justify-start mb-6'>
                        <div>
                            <p className='text-lg font-semibold'>Latitude</p>
                            <input type='number' id='latitude' value={latitude} onChange={onChange} min='-90' max='90' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6 text-center' />
                        </div>
                        <div>
                            <p className='text-lg font-semibold'>Longitude</p>
                            <input type='number' id='longitude' value={longitude} onChange={onChange} min='-180' max='180' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6 text-center' />
                        </div>
                    </div>
                )}
                <p className='text-lg font-semibold'>Description</p>
                <textarea type='text' id='description' value={description} onChange={onChange} placeholder='Description' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />

                <p className='text-lg font-semibold'>Offer</p>
                <div className='flex mb-6'>
                    <button type='button' id='offer' value={true} onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!offer ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Yes</button>

                    <button type='button' id='offer' value={false} onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${offer ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>No</button>
                </div>
                <div className='flex items-center mb-6'>
                    <div>
                        <p className='text-lg font-semibold'>Regular Price</p>
                        <div className='flex w-full justify-center items-center space-x-6'>
                            <input type='number' id='regularPrice' value={regularPrice} onChange={onChange} placeholder='Regular Price' min='50' max='4000000' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />

                            {type === "rent" && (
                                <div className=''>
                                    <p className='text-md w-full whitespace-nowrap'>$ / Month</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
                {offer && (
                    <div className='flex items-center mb-6'>
                        <div>
                            <p className='text-lg font-semibold'>Discounted Price</p>
                            <div className='flex w-full justify-center items-center space-x-6'>
                                <input type='number' id='discountedPrice' value={discountedPrice} onChange={onChange} placeholder='Regular Price' min='50' max='4000000' required={offer} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />

                                {type === "rent" && (
                                    <div className=''>
                                        <p className='text-md w-full whitespace-nowrap'>$ / Month</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}
                <div className='mb-6'>
                    <p className='text-lg font-semibold'>Images</p>
                    <p className='text-gray-500'>The first image will be cover (max 6)</p>
                    <input type="file" id="images" onChange={onChange} accept='.jpg,.png,.jpeg' multiple required className='w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600' />
                </div>

                <button type='submit' className='mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out'>Create Listing</button>
            </form>
        </main>
    )
}
