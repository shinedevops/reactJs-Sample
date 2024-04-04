import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TraingleSpinner from "../../../../Helpers/Loaders/TraingleSpinner";
import {
    getBuyNowDetail,
    buyPlaceOrderAPi,
    buyProductOnISP,
} from "../../../../comerzioApi's";
import { useApolloClient } from "@apollo/client";
import { MutationHitter, QueryHitter } from "../../../../Helpers/GraphQLHelper";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import * as Yup from "yup";
import AskForConfirmation from "../../../../Helpers/PopUps/askForConfirmation";

export function BuyNowPaymentView() {
    const [loader, setLoader] = useState(false);
    const client = useApolloClient();
    const [paymentDetails, setPaymentDetail] = useState({});

    const params = useParams();
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
        getBuyNowFunc();
    }, []);
    const Navigate = useNavigate();
    const { id } = params;

    const initialValues = {
        amount: paymentDetails?.product?.price || 0,
        shippingType: paymentDetails?.product?.isPickupAvailable
            ? "PICK_UP"
            : "SHIPPING",
        addInsurance: false,
        acceptBinding: false,
        termCond: false,
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            acceptBinding: Yup.boolean()
                .required("Accept Binding is Required")
                .oneOf([true], "Accept Binding is Required"),
            termCond: Yup.boolean()
                .required("Terms and Conditions are Required")
                .oneOf([true], "Terms and Conditions are Required"),
        }),
        enableReinitialize: true,
        validateOnMount: true,
        onSubmit: (values) => {
            if (paymentDetails?.product?.instantSellingPrice) {
                placeOrderISP(values);
            } else {
                PlaceMyOrder(values);
            }
        },
    });

    /**
     * @description get Insurance percentage 
     * @returns 
     */
    function getInsurancePercent() {
        try {
            let p = Number(paymentDetails?.product?.instantSellingPrice || paymentDetails?.product?.price);
            return p * 0.05;
        } catch (error) {
            return 0;
        }
    }

    function getTotalPrice() {
        try {
            let price = Number(paymentDetails?.product?.instantSellingPrice || paymentDetails?.product?.price);
            if (formik.values.addInsurance) {
                price = price + getInsurancePercent();
            }
            if (formik.values.shippingType === "SHIPPING") {
                price = price + paymentDetails?.product?.shippingPrice ?? 0
            }
            return price;
        } catch (error) {
            return 0;
        }
    }

    async function getBuyNowFunc() {
        setLoader(true);
        let variables = {
            getProdDetails: {
                uuid: id,
            },
        };
        const response = await QueryHitter(client, getBuyNowDetail, variables);
        setLoader(false);
        if (response?.success) {
            if (response?.result?.errors) {
                let errResponse = response?.result?.errors[0]?.message;
                toast.error(errResponse || "Something went wrong", {
                    pauseOnHover: false,
                });
                Navigate(-1);
            } else {
                setPaymentDetail(response?.result?.data?.BuyNowProdDetail?.data);
            }
        } else if (response?.error) {
            toast.error(response?.errMessage, { pauseOnHover: false });
            Navigate(-1);
        } else {
            toast.error("Something went wrong", { pauseOnHover: false });
            Navigate(-1);
        }
    }
    // console.log("paymentDetails=>", paymentDetails);
    async function PlaceMyOrder(values) {
        setLoader(true);
        let variables = {
            buyProduct: {
                uuid: id,
                shippingType: values?.shippingType,
                insurance: values?.addInsurance,
            },
        };
        const response = await MutationHitter(client, buyPlaceOrderAPi, variables);
        setLoader(false);
        if (response?.success) {
            if (response?.result?.errors) {
                let errResponse = response?.result?.errors[0]?.message;
                toast.error(errResponse || "Something went wrong", {
                    pauseOnHover: false,
                });
                Navigate(-1);
            } else {
                toast.success(response?.result?.data?.BuyProduct?.message);
                Navigate("/MyAccount/my-buying?page=1&listType=Purchased&status=All&sortBy=Newest");
            }
        } else if (response?.error) {
            toast.error(response?.errMessage, { pauseOnHover: false });
            Navigate(-1);
        } else {
            toast.error("Something went wrong", { pauseOnHover: false });
            Navigate(-1);
        }
    }

    async function placeOrderISP(values) {
        setLoader(true);
        let variables = {
            buyProduct: {
                uuid: id,
                shippingType: values?.shippingType,
                insurance: values?.addInsurance,
            },
        };
        const response = await MutationHitter(client, buyProductOnISP, variables);
        setLoader(false);
        if (response?.success) {
            if (response?.result?.errors) {
                let errResponse = response?.result?.errors[0]?.message;
                toast.error(errResponse || "Something went wrong", {
                    pauseOnHover: false,
                });
                Navigate(-1);
            } else {
                toast.success(response?.result?.data?.BuyProduct?.message);
                Navigate("/MyAccount/my-buying?page=1&listType=Purchased&status=All&sortBy=Newest");
            }
        } else if (response?.error) {
            toast.error(response?.errMessage, { pauseOnHover: false });
            Navigate(-1);
        } else {
            toast.error("Something went wrong", { pauseOnHover: false });
            Navigate(-1);
        }
    }

    return (
        <div>
            <main className="main product-page">
                <section>
                    <div className="product-top-sec">
                        <div className="protop-bar-bg">
                            <div className="container">
                                <div className="back-row">
                                    <ul>
                                        <li onClick={() => Navigate(-1)}>
                                            <button type="button">
                                                <i className="fa-solid fa-angle-left" /> Back
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button">
                                                <i className="fa-solid fa-house" />
                                            </button>
                                        </li>
                                        <li>{paymentDetails?.product?.category?.title}</li>
                                        <li>{paymentDetails?.product?.title}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>

                    <div className="product-price-details-sec">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-7 col-lg-8">
                                    {paymentDetails?.product?.isPickupAvailable &&
                                        paymentDetails?.product?.isShippingAvailable ? (
                                        <>
                                            {/* Pickup */}
                                            <div className="pro-delivery-adderss">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="check-box-checked">
                                                            <input
                                                                id="pickUpCheck"
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={
                                                                    formik.values.shippingType == "PICK_UP"
                                                                        ? true
                                                                        : false
                                                                }
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        formik.setFieldValue(
                                                                            "shippingType",
                                                                            "PICK_UP"
                                                                        );
                                                                    } else {
                                                                        formik.setFieldValue(
                                                                            "shippingType",
                                                                            "SHIPPING"
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <label for="pickUpCheck" htmlFor="pickUpCheck">
                                                                Pickup
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12">
                                                        <div className="delivery-addres-title">
                                                            <h6>Pickup Address</h6>
                                                            <p
                                                                className="address"
                                                                onClick={() =>
                                                                    paymentDetails?.product?.pickupAddress
                                                                        ? window.open(
                                                                            `https://www.google.com/maps/search/${paymentDetails?.product?.pickupAddress}`
                                                                        )
                                                                        : null
                                                                }
                                                            >
                                                                {paymentDetails?.product?.pickupAddress ||
                                                                    "No address found"}
                                                                <i className="fa-solid fa-up-right-from-square"></i>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {paymentDetails?.product?.pickupDetails ? (
                                                        <div className="col-md-6">
                                                            <div className="delivery-addres-title">
                                                                <h6>Pickup details: </h6>
                                                                <p className="scrollDesc">
                                                                    {paymentDetails?.product?.pickupDetails}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Availability For Pickup</h6>
                                                            <p>
                                                                {paymentDetails?.product?.pickupType ===
                                                                    "FLEXIBLE"
                                                                    ? "FLEXIBLE"
                                                                    : paymentDetails?.product
                                                                        ?.availabilityForPickup}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Shipping */}
                                            <div className="pro-delivery-adderss">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="check-box-checked">
                                                            <input
                                                                id="shippingCheck"
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={
                                                                    formik.values.shippingType == "SHIPPING"
                                                                        ? true
                                                                        : false
                                                                }
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        formik.setFieldValue(
                                                                            "shippingType",
                                                                            "SHIPPING"
                                                                        );
                                                                    } else {
                                                                        formik.setFieldValue(
                                                                            "shippingType",
                                                                            "PICK_UP"
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor="shippingCheck">Shipping {paymentDetails?.product?.shippingPrice ? <>(${paymentDetails?.product?.shippingPrice})</> : null} </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div
                                                                    className="delivery-addres-title"
                                                                    onClick={() =>
                                                                        paymentDetails?.userDetails?.street
                                                                            ? window.open(
                                                                                `https://www.google.com/maps/search/${paymentDetails?.userDetails?.street}`
                                                                            )
                                                                            : null
                                                                    }
                                                                >
                                                                    <h6>Your Delivery Adderss</h6>
                                                                    <p className="address">
                                                                        {paymentDetails?.userDetails?.street ||
                                                                            "No address found"}
                                                                        <i className="fa-solid fa-up-right-from-square"></i>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <a
                                                                    className="button"
                                                                    onClick={() =>
                                                                        Navigate("/MyAccount/profile-setting")
                                                                    }
                                                                >
                                                                    {paymentDetails?.userDetails?.street
                                                                        ? "Change"
                                                                        : "Add"}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        {paymentDetails?.product?.shippingDescription ? (
                                                            <div className="delivery-addres-title">
                                                                <h6>Shipping description: </h6>
                                                                <p className="scrollDesc">
                                                                    {paymentDetails?.product?.shippingDescription}
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Shipping From Abroad (Dropshipping): </h6>
                                                            <p>
                                                                {paymentDetails?.product?.shpngFromAbroad
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Shipping outside Switzerland: </h6>
                                                            <p>
                                                                {paymentDetails?.product?.shpngOutsideSwitz
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : paymentDetails?.product?.isPickupAvailable ? (
                                        <div className="pro-delivery-adderss">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="check-box-checked">
                                                        <input
                                                            id="pickUpCheck"
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={
                                                                formik.values.shippingType == "PICK_UP"
                                                                    ? true
                                                                    : false
                                                            }

                                                        />
                                                        <label for="pickUpCheck" htmlFor="pickUpCheck">
                                                            Pickup
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="delivery-addres-title">
                                                        <h6>Pickup Adderss</h6>
                                                        <p
                                                            className="address"
                                                            onClick={() =>
                                                                paymentDetails?.product?.pickupAddress
                                                                    ? window.open(
                                                                        `https://www.google.com/maps/search/${paymentDetails?.product?.pickupAddress}`
                                                                    )
                                                                    : null
                                                            }
                                                        >
                                                            {paymentDetails?.product?.pickupAddress ||
                                                                "No address found"}
                                                            <i className="fa-solid fa-up-right-from-square"></i>
                                                        </p>
                                                    </div>
                                                </div>
                                                {paymentDetails?.product?.pickupDetails ? (
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Pickup detail: </h6>
                                                            <p className="scrollDesc">
                                                                {paymentDetails?.product?.pickupDetails}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="col-md-6">
                                                    <div className="delivery-addres-title">
                                                        <h6>Availability For Pickup</h6>
                                                        <p>
                                                            {paymentDetails?.product?.pickupType ===
                                                                "FLEXIBLE"
                                                                ? "FLEXIBLE"
                                                                : paymentDetails?.product
                                                                    ?.availabilityForPickup}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="pro-delivery-adderss">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="check-box-checked">
                                                            <input
                                                                id="shippingCheck"
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={
                                                                    formik.values.shippingType == "SHIPPING"
                                                                        ? true
                                                                        : false
                                                                }

                                                            />
                                                            <label htmlFor="shippingCheck">Shipping</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div
                                                                    className="delivery-addres-title"
                                                                    onClick={() =>
                                                                        paymentDetails?.userDetails?.street
                                                                            ? window.open(
                                                                                `https://www.google.com/maps/search/${paymentDetails?.userDetails?.street}`
                                                                            )
                                                                            : null
                                                                    }
                                                                >
                                                                    <h6>Your Delivery Adderss</h6>
                                                                    <p className="address">
                                                                        {paymentDetails?.userDetails?.street ||
                                                                            "No address found"}
                                                                        <i className="fa-solid fa-up-right-from-square"></i>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <a
                                                                    className="button"
                                                                    onClick={() =>
                                                                        Navigate("/MyAccount/profile-setting")
                                                                    }
                                                                >
                                                                    {paymentDetails?.userDetails?.street
                                                                        ? "Change"
                                                                        : "Add"}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        {paymentDetails?.product?.shippingDescription ? (
                                                            <div className="delivery-addres-title">
                                                                <h6>Shipping description: </h6>
                                                                <p>
                                                                    {paymentDetails?.product?.shippingDescription}
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Shipping From Abroad (Dropshipping): </h6>
                                                            <p>
                                                                {paymentDetails?.product?.shpngFromAbroad
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="delivery-addres-title">
                                                            <h6>Shipping outside Switzerland: </h6>
                                                            <p>
                                                                {paymentDetails?.product?.shpngOutsideSwitz
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}


                                    <div className="pro-delivery-title-row buy-product-title">
                                        <div className="pro-details-img-row">
                                            <LazyLoadImage
                                                src={paymentDetails?.product?.productImages[0]?.src}
                                                alt="profile-img"
                                                effect="blur"
                                            //
                                            />

                                        </div>
                                        <div className="pro-datails-title-content">
                                            <h6>{paymentDetails?.product?.title}</h6>
                                            <p className="small">
                                                {paymentDetails?.product?.description}
                                            </p>
                                            <div className="price-delvery-free">
                                                <h4>
                                                    $
                                                    {paymentDetails?.product?.instantSellingPrice ||
                                                        paymentDetails?.product?.price}
                                                </h4>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-5 col-lg-4">
                                    <div className="product-price-details-overview">
                                        <h6>Price Details</h6>
                                        <ul>
                                            <li>
                                                <p>Price (Item)</p>
                                                <span>
                                                    $
                                                    {paymentDetails?.product?.instantSellingPrice ||
                                                        paymentDetails?.product?.price}
                                                </span>
                                            </li>

                                            <li>
                                                <p>Delivery Charges</p>
                                                <span>{formik.values.shippingType === "SHIPPING" ? (
                                                    <>${paymentDetails?.product?.shippingPrice}</>
                                                ) : "Free"}</span>
                                            </li>
                                            {formik?.values?.addInsurance ? (
                                                <li>
                                                    <p>Insurance</p>
                                                    <span>${getInsurancePercent()}</span>
                                                </li>
                                            ) : null}
                                            <li>
                                                {/* <p>Want to add Insurance</p> */}
                                                <p>
                                                    <input
                                                        id="insuranceCheck"
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={formik.values.addInsurance}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                formik.setFieldValue("addInsurance", true);
                                                            } else {
                                                                formik.setFieldValue("addInsurance", false);
                                                            }
                                                        }}
                                                    />{" "}
                                                    <label htmlFor="insuranceCheck">
                                                        Insurance-5% additional fee
                                                    </label>
                                                </p>
                                            </li>


                                            <li>
                                                <h6>Total Price</h6>
                                                <span>
                                                    $
                                                    {getTotalPrice()}
                                                </span>
                                            </li>
                                        </ul>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formik.values.acceptBinding}
                                                id="flexCheckChecked3"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        formik.setFieldValue("acceptBinding", true);
                                                    } else {
                                                        formik.setFieldValue("acceptBinding", false);
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="flexCheckChecked3">
                                                Accept Binding
                                            </label>
                                            <div className="red-error">
                                                {formik?.touched?.acceptBinding && formik?.errors?.acceptBinding ? (
                                                    <label>{formik.errors.acceptBinding}</label>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formik.values.termCond}
                                                id="flexCheckChecked31"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        formik.setFieldValue("termCond", true);
                                                    } else {
                                                        formik.setFieldValue("termCond", false);
                                                    }
                                                }}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="flexCheckChecked31"
                                            >
                                                Terms & Conditions
                                            </label>
                                            <div className="red-error">
                                                {formik?.touched?.termCond && formik?.errors?.termCond ? (
                                                    <label>{formik.errors.termCond}</label>
                                                ) : null}
                                            </div>
                                        </div>
                                        <a
                                            // href="#"
                                            onClick={
                                                async () => {
                                                    if (formik.isValid) {
                                                        let confirm = await AskForConfirmation({
                                                            title: "Are you sure to buy this product?",
                                                            icon: "warning",
                                                            showCnclBtn: true,
                                                            showConfirmbtn: true
                                                        });
                                                        if (confirm.isConfirmed) {
                                                            formik.handleSubmit();
                                                        }
                                                    } else {
                                                        formik.setTouched({
                                                            termCond: true,
                                                            acceptBinding: true
                                                        });
                                                    }
                                                }}
                                            className="primary-btn"

                                        >
                                            Place Order
                                        </a>
                                    </div>
                                    {/* Modal */}
                                    <div
                                        className="modal fade"
                                        id="payment-methods"
                                        tabIndex={-1}
                                        aria-labelledby="exampleModalLabel"
                                        aria-hidden="true"
                                    >
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-body">
                                                    <div className="modal-header">
                                                        <h6>Payment Methods</h6>
                                                        <button
                                                            type="button"
                                                            className="btn-close"
                                                            data-bs-dismiss="modal"
                                                            aria-label="Close"
                                                        />
                                                    </div>
                                                    <div className="popup-payment-card-row">
                                                        <ul>
                                                            <li>
                                                                <div className="card-row">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="flexRadioDefault"
                                                                            id="flexRadioDefault1"
                                                                        />
                                                                        <span>Debit card</span>
                                                                        <label
                                                                            className="form-check-label"
                                                                            htmlFor="flexRadioDefault1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div className="card-row">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="flexRadioDefault"
                                                                            id="flexRadioDefault2"
                                                                        />
                                                                        <span>Credit card</span>
                                                                        <label
                                                                            className="form-check-label"
                                                                            htmlFor="flexRadioDefault2"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div className="card-row">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="flexRadioDefault"
                                                                            id="flexRadioDefault3"
                                                                        />
                                                                        <span>Bank Transfer</span>
                                                                        <label
                                                                            className="form-check-label"
                                                                            htmlFor="flexRadioDefault3"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        <form className="form-inline">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <div className="formfield">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="card-number"
                                                                                placeholder="Card number"
                                                                            />
                                                                            <span className="icon">
                                                                                <svg
                                                                                    width={26}
                                                                                    height={19}
                                                                                    viewBox="0 0 26 19"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        clipRule="evenodd"
                                                                                        d="M0 2.5909V16.409C0 17.0965 0.272967 17.7554 0.759158 18.2408C1.24456 18.7269 1.9035 18.9999 2.5909 18.9999H23.3181C24.0055 18.9999 24.6644 18.727 25.1498 18.2408C25.636 17.7554 25.909 17.0964 25.909 16.409V2.5909C25.909 1.90345 25.636 1.24457 25.1498 0.759158C24.6644 0.272977 24.0055 0 23.3181 0H2.5909C1.90345 0 1.24457 0.272967 0.759158 0.759158C0.272977 1.24456 0 1.9035 0 2.5909ZM24.1817 8.63633V16.409C24.1817 16.6378 24.0911 16.8582 23.9286 17.0195C23.7671 17.1819 23.5469 17.2726 23.3181 17.2726H2.5909C2.36208 17.2726 2.14173 17.182 1.98039 17.0195C1.81807 16.858 1.72727 16.6378 1.72727 16.409V8.63633H24.1817ZM24.1817 3.45453H1.72727V2.5909C1.72727 2.36207 1.81787 2.14173 1.98038 1.98038C2.14192 1.81807 2.36207 1.72727 2.59089 1.72727H23.3181C23.5469 1.72727 23.7672 1.81787 23.9286 1.98038C24.0909 2.14193 24.1817 2.36208 24.1817 2.5909L24.1817 3.45453Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        clipRule="evenodd"
                                                                                        d="M5.18199 12.0908H12.9547C13.4314 12.0908 13.8183 11.7039 13.8183 11.2272C13.8183 10.7504 13.4314 10.3635 12.9547 10.3635H5.18199C4.70526 10.3635 4.31836 10.7504 4.31836 11.2272C4.31836 11.7039 4.70526 12.0908 5.18199 12.0908Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        clipRule="evenodd"
                                                                                        d="M20.7347 13.9529C20.9316 13.7405 21.214 13.6067 21.5267 13.6067C22.1225 13.6067 22.6062 14.0911 22.6062 14.6862C22.6062 15.2821 22.1225 15.7658 21.5267 15.7658C21.214 15.7658 20.9316 15.6328 20.7347 15.4203C20.5379 15.6328 20.2555 15.7658 19.9428 15.7658C19.347 15.7658 18.8633 15.2821 18.8633 14.6862C18.8633 14.0911 19.347 13.6067 19.9428 13.6067C20.2555 13.6067 20.5379 13.7405 20.7347 13.9529Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                        <div className="is-invalid">
                                                                            Please provide a valid zip.
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <div className="formfield">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="holder-name"
                                                                                placeholder="Card Holder name"
                                                                            />
                                                                            <span className="icon">
                                                                                <svg
                                                                                    width={16}
                                                                                    height={19}
                                                                                    viewBox="0 0 16 19"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M8.37323 11.0724C9.84157 11.0724 11.2497 10.4893 12.288 9.45095C13.3262 8.41277 13.9095 7.00447 13.9095 5.53631C13.9095 4.06797 13.3262 2.65967 12.288 1.62149C11.2497 0.583316 9.84157 0 8.37323 0C6.90489 0 5.49677 0.583316 4.45841 1.62149C3.42023 2.65967 2.83691 4.06797 2.83691 5.53631C2.84384 7.00252 3.42928 8.40672 4.46605 9.44349C5.50282 10.4803 6.90702 11.0657 8.37323 11.0724Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                    <path
                                                                                        d="M12.3766 11.332C12.2264 11.3336 12.0843 11.3999 11.9867 11.514C11.1047 12.5068 9.85669 13.0982 8.52977 13.1515C7.12092 13.1632 5.77553 12.5664 4.83879 11.514C4.74124 11.3999 4.5991 11.3336 4.44896 11.332C3.48629 11.332 2.56324 11.7164 1.88504 12.3995C1.20665 13.0828 0.829073 14.0083 0.836032 14.9709V18.48C0.836032 18.6178 0.890757 18.75 0.988306 18.8476C1.08585 18.945 1.21805 18.9999 1.35593 18.9999H15.3916C15.5295 18.9999 15.6617 18.945 15.7592 18.8476C15.8568 18.75 15.9115 18.6178 15.9115 18.48V14.9709C15.9325 14.0177 15.57 13.0957 14.9057 12.4118C14.2412 11.7277 13.3302 11.3388 12.3766 11.332Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                        <div className="is-invalid">
                                                                            Please provide a valid zip.
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <div className="formfield">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="date-birth"
                                                                                placeholder="Date of Birth"
                                                                            />
                                                                            <span className="icon">
                                                                                <svg
                                                                                    width={19}
                                                                                    height={19}
                                                                                    viewBox="0 0 19 19"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M16.4438 2.44214H14.9126V2.87784C14.9126 3.35662 14.6573 3.79905 14.2427 4.03844C13.8278 4.27783 13.317 4.27783 12.9023 4.03844C12.4877 3.79905 12.2324 3.35662 12.2324 2.87784V2.44236L5.91679 2.44214V2.87784C5.91679 3.35662 5.66147 3.79905 5.24686 4.03844C4.83202 4.27783 4.32117 4.27783 3.90654 4.03844C3.49192 3.79905 3.23661 3.35662 3.23661 2.87784V2.44236L1.6484 2.44214C1.21158 2.44147 0.792266 2.61422 0.483091 2.92294C0.173926 3.23143 4.55727e-05 3.65053 4.55727e-05 4.08733V6.55999H18.0923V4.08733C18.0923 3.65051 17.9184 3.23143 17.6092 2.92294C17.3001 2.61422 16.8807 2.44147 16.4439 2.44214L16.4438 2.44214ZM0 7.90007V17.3551C0 17.7919 0.173875 18.2108 0.483045 18.5195C0.792209 18.828 1.21156 19.001 1.64836 19.0001H16.4438C16.8806 19.001 17.2999 18.828 17.6091 18.5195C17.9182 18.2108 18.0921 17.7919 18.0921 17.3551V7.90007H0Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                    <path
                                                                                        d="M14.2427 0.670159V2.87804C14.2427 3.24801 13.9425 3.54797 13.5725 3.54797C13.2023 3.54797 12.9023 3.248 12.9023 2.87804V0.670159C12.9023 0.299969 13.2023 0 13.5725 0C13.9425 0 14.2427 0.299969 14.2427 0.670159Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                    <path
                                                                                        d="M5.24657 0.670159V2.87804C5.24657 3.24801 4.94637 3.54797 4.57641 3.54797C4.20622 3.54797 3.90625 3.248 3.90625 2.87804V0.670159C3.90625 0.299969 4.20622 0 4.57641 0C4.94637 0 5.24657 0.299969 5.24657 0.670159Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                        <div className="is-invalid">
                                                                            Please provide a valid zip.
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <div className="formfield">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="CVV"
                                                                                placeholder="CVV"
                                                                            />
                                                                            <span className="icon">
                                                                                <svg
                                                                                    width={25}
                                                                                    height={19}
                                                                                    viewBox="0 0 25 19"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M3.30356 18.4453H21.7491C22.3605 18.4453 22.947 18.2023 23.3793 17.77C23.8118 17.3375 24.0546 16.751 24.0546 16.1396V2.30571C24.0546 1.69431 23.8118 1.1078 23.3793 0.675291C22.947 0.242982 22.3605 0 21.7491 0H3.30356C2.69215 0 2.10565 0.242982 1.67334 0.675291C1.24084 1.10779 0.998047 1.69431 0.998047 2.30571V16.1396C0.998047 16.751 1.24084 17.3375 1.67334 17.77C2.10565 18.2023 2.69215 18.4453 3.30356 18.4453ZM3.30356 4.61143H21.7491V9.22266H3.30356V4.61143ZM4.16818 12.9696H8.77941L8.7796 12.9694C9.0884 12.9694 9.37382 13.1342 9.52821 13.4017C9.6828 13.6692 9.6828 13.9988 9.52821 14.2663C9.37382 14.5338 9.08838 14.6986 8.7796 14.6986H4.16818C3.85938 14.6986 3.57396 14.5338 3.41956 14.2663C3.26498 13.9988 3.26498 13.6692 3.41956 13.4017C3.57396 13.1342 3.8594 12.9694 4.16818 12.9694L4.16818 12.9696Z"
                                                                                        fill="#BDBDBD"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                        <div className="is-invalid">
                                                                            Please provide a valid zip.
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button className="primary-btn">Save</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <div>{loader ? <TraingleSpinner /> : null}</div>
        </div>
    );
}
