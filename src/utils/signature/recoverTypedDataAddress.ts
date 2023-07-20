import type { Address, TypedData } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'

import { hashTypedData } from './hashTypedData.js'
import { recoverAddress } from './recoverAddress.js'

export type RecoverTypedDataAddressParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
> = TypedDataDefinition<typedData, primaryType> & {
  signature: Hex | ByteArray
}
export type RecoverTypedDataAddressReturnType = Address

export async function recoverTypedDataAddress<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  parameters: RecoverTypedDataAddressParameters<typedData, primaryType>,
): Promise<RecoverTypedDataAddressReturnType> {
  const { domain, message, primaryType, signature, types } =
    parameters as unknown as RecoverTypedDataAddressParameters
  return recoverAddress({
    hash: hashTypedData({
      domain,
      message,
      primaryType,
      types,
    }),
    signature,
  })
}
