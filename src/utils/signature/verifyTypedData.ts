import type { Address, TypedData } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import { getAddress } from '../address/getAddress.js'
import { isAddressEqual } from '../address/isAddressEqual.js'

import {
  type RecoverTypedDataAddressParameters,
  recoverTypedDataAddress,
} from './recoverTypedDataAddress.js'

export type VerifyTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
> = TypedDataDefinition<typedData, primaryType> & {
  /** The address to verify the typed data for. */
  address: Address
  /** The signature to verify */
  signature: Hex | ByteArray
}

export type VerifyTypedDataReturnType = boolean

/**
 * Verify that typed data was signed by the provided address.
 *
 * Note:  Only supports Externally Owned Accounts. Does not support Contract Accounts.
 *        It is highly recommended to use `publicClient.verifyTypedData` instead to ensure
 *        wallet interoperability.
 *
 * - Docs {@link https://viem.sh/docs/utilities/verifyTypedData.html}
 *
 * @param parameters - {@link VerifyTypedDataParameters}
 * @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
 */
export async function verifyTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  parameters: VerifyTypedDataParameters<typedData, primaryType>,
): Promise<VerifyTypedDataReturnType> {
  const { address, domain, message, primaryType, signature, types } =
    parameters as unknown as VerifyTypedDataParameters
  return isAddressEqual(
    getAddress(address),
    await recoverTypedDataAddress({
      domain,
      message,
      primaryType,
      signature,
      types,
    } as RecoverTypedDataAddressParameters),
  )
}
