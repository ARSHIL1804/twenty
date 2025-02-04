import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import {
  query,
  responseData,
  variables,
} from '../__mocks__/useFilteredSearchEntityQuery';
import { useFilteredSearchEntityQuery } from '../useFilteredSearchEntityQuery';

const mocks = [
  {
    request: {
      query,
      variables: variables.entitiesToSelect,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
  {
    request: {
      query,
      variables: variables.filteredSelectedEntities,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
  {
    request: {
      query,
      variables: variables.selectedEntities,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFilteredSearchEntityQuery', () => {
  it('returns the correct result when everything is provided', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
        setCurrentWorkspace({
          id: '32219445-f587-4c40-b2b1-6d3205ed96da',
          displayName: 'cool-workspace',
          allowImpersonation: false,
          subscriptionStatus: 'incomplete',
        });

        const mockObjectMetadataItems = getObjectMetadataItemsMock();

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(mockObjectMetadataItems);

        return useFilteredSearchEntityQuery({
          orderByField: 'name',
          filters: [{ fieldNames: ['name'], filter: 'Entity' }],
          sortOrder: 'AscNullsLast',
          selectedIds: ['1'],
          mappingFunction: (entity): any => ({
            value: entity.id,
            label: entity.name,
          }),
          limit: 10,
          excludeEntityIds: ['2'],
          objectNameSingular: 'person',
        });
      },
      { wrapper: Wrapper },
    );

    const expectedResult: EntitiesForMultipleEntitySelect<any> = {
      selectedEntities: [],
      filteredSelectedEntities: [],
      entitiesToSelect: [],
      loading: true,
    };

    expect(result.current).toEqual(expectedResult);
  });
});
