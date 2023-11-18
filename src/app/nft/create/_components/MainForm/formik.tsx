import { Form, Formik, FormikProps } from "formik"
import React, { ReactNode, createContext } from "react"
import * as Yup from "yup"
import { useSelector } from "react-redux"
import { RootState } from "@redux"
import { ERC721Contract } from "@blockchain"
import { chainInfos } from "@config"
import { pinataPOSTFile, pinataPOSTJson } from "@api"
import { Address } from "web3"

interface FormikValues {
    name: string,
    collection: string,
    description: string,
    imageFile: File | null,
    _tagInput: string,
    tags: string[],
    externalUrl: string
}

const initialValues: FormikValues = {
    name: "",
    collection: "",
    description: "",
    imageFile: null,
    _tagInput: "",
    tags: [],
    externalUrl: ""
}

export const FormikPropsContext =
  createContext<FormikProps<FormikValues> | null>(null)

const _renderBody = (
    props: FormikProps<FormikValues> | null,
    chidren: ReactNode
) => (
    <FormikPropsContext.Provider value={props}>
        <Form onSubmit={props?.handleSubmit}>
            {chidren}
        </Form>
    </FormikPropsContext.Provider>
)

const FormikProviders = ({ children }: { children: ReactNode }) => {
    const chainName = useSelector((state: RootState) => state.blockchain.chainName)
    const web3 = useSelector((state: RootState) => state.blockchain.web3)

    const account = useSelector((state: RootState) => state.blockchain.account)

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object({
                name: Yup.string().required("Name is required"),
                collection: Yup.string().required("Collection is required"),
                description: Yup.string().required("Description is required"),
                imageFile: Yup.mixed().test("Image is required", (value) => {
                    return value !== null
                }),
                tags: Yup.array().required(),
                externalUrl: Yup.string().required("External URL is required")
            })}
            onSubmit={
                async (values) => {
                    if (web3 == null) return
                    
                    const file = values.imageFile
                    
                    if (file == null) return
                    const addFileResponse = await pinataPOSTFile(file)

                    const imageCID = addFileResponse?.IpfsHash
                    if (!imageCID || imageCID == null) return 

                    const NFTAddress = chainInfos[chainName].NFTAddress
                    const erc721Contract = new ERC721Contract(
                        chainName,
                        NFTAddress,
                        web3,
                        account
                    )

                    const uri : NFTURI = {
                        name: values.name,
                        author: account,
                        collection: values.collection,
                        description: values.description,
                        externalUrl: values.externalUrl,
                        tags: values.tags,
                        imageCID
                    }

                    const addJsonResponse = await pinataPOSTJson(uri)
                    const uriHash = addJsonResponse?.IpfsHash
                    if (!uriHash || uriHash == null) return 

                    const receipt = await erc721Contract.safeMint(account, uriHash)
                    console.log(receipt)
                }}
        >
            {(props) => _renderBody(props, children)}
        </Formik>
    )
}

export default FormikProviders

export interface NFTURI {
    name: string;
    author: Address;
    collection: string;
    description: string;
    externalUrl: string;
    tags: string[]
    imageCID: string
  }
  