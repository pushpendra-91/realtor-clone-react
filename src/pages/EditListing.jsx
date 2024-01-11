import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router';


export default function EditListing() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [geoLocationEnabled, setGeoLocationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
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

    const params = useParams();

    useEffect(() => {
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error("You don't have permission to edit this listing!");
            navigate("/");
        }
    }, [navigate, listing, auth.currentUser.uid]);

    useEffect(() => {
        setLoading(true);
        async function fetchListing() {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing(docSnap.data());
                // setFormData({ ...docSnap.data() })
                setFormData(() => ({
                    ...docSnap.data(),
                    latitude: docSnap.data().geoLocation.lat,
                    longitude: docSnap.data().geoLocation.lng
                }))
                setLoading(false);
            } else {
                navigate("/")
                toast.error("Listing Doesn't Exist");
            }
        }
        fetchListing();
    }, [navigate, params.listingId]);

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

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (parseInt(discountedPrice, 10) >= parseInt(regularPrice, 10)) {
            console.log(typeof discountedPrice);
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
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_geocode_apiKey}`);
            const data = await response.json();
            geoLocation.lat = data.results[0]?.geometry.location.lat ?? 0;
            geoLocation.lng = data.results[0]?.geometry.location.lng ?? 0;

            location = data.status === "ZERO_RESULTS" && undefined;

            if (location === undefined || location.includes("undefined")) {
                setLoading(false);
                toast.error("Enter a correct Address");
                return;
            }
        } else {
            geoLocation.lat = latitude || 0;
            geoLocation.lng = longitude || 0;
        }

        async function storeImage(image) {
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = ref(storage, filename);
                const uploadTask = uploadBytesResumable(storageRef, image);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                // console.log('Upload is paused');
                                break;
                            case 'running':
                                // console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        // Handle unsuccessful uploads
                        reject(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            // console.log('File available at', downloadURL);
                            resolve(downloadURL);
                        });
                    }
                );

            })
        }

        const imgUrls = await Promise.all([...images].map((image) => storeImage(image))).catch((error) => {
            setLoading(false);
            toast.error("Images not uploaded");
            return;
        })
        // console.log("urls: ", imgUrls);
        const formDataCopy = {
            ...formData,
            imgUrls,
            geoLocation,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        };
        delete formDataCopy.images;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;
        delete formDataCopy.latitude;
        delete formDataCopy.longitude;
        const docRef = doc(db, 'listings', params.listingId);
        await updateDoc(docRef, formDataCopy);
        setLoading(false);
        toast.success("Updated Successfully");
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    }

    if (loading) {
        return <Spinner />;
    }
    return (
        <main className='max-w-md px-2 mx-auto'>
            <h1 className='text-3xl text-center mt-6 font-bold'>Edit a Listing</h1>
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
                        <input type='number' id='bathrooms' value={bathrooms} onChange={onChange} placeholder='Bathroom' min='1' max='20' required className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                    </div>
                </div>
                <p className='text-lg mt-6 font-semibold'>Parking Spot</p>
                <div className='flex '>
                    <button type='button' id='parking' value={true} onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!parking ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Yes</button>

                    <button type='button' id='parking' value={false} onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${parking ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>No</button>
                </div>
                <p className='text-lg mt-6 font-semibold'>Furnished</p>
                <div className='flex '>
                    <button type='button' id='furnished' value={true} onClick={onChange} className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>Yes</button>

                    <button type='button' id='furnished' value={false} onClick={onChange} className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'}`}>No</button>
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

                <button type='submit' className='mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out'>Edit Listing</button>
            </form>
        </main>
    )
}
